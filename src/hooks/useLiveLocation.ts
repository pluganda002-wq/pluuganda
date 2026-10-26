import { useCallback, useEffect, useRef, useState } from "react";
import {
  getTelegramLocationManager,
  initTelegramLocationManager,
  readTelegramLocation,
  type TgLocationData,
} from "@/lib/tugende/telegramLocation";

export type LivePosition = {
  lat: number;
  lng: number;
  accuracyM?: number;
  source: "telegram" | "browser";
  updatedAt: number;
};

export type LiveLocationStatus = "idle" | "starting" | "active" | "denied" | "unavailable";

const GRANTED_KEY = "plu-tugende-loc-granted";
const LAST_POS_KEY = "plu-tugende-last-pos";

function readCachedPosition(): LivePosition | null {
  try {
    const raw = sessionStorage.getItem(LAST_POS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LivePosition;
  } catch {
    return null;
  }
}

function cachePosition(pos: LivePosition) {
  sessionStorage.setItem(LAST_POS_KEY, JSON.stringify(pos));
}

function fromTg(loc: TgLocationData): LivePosition {
  return {
    lat: loc.latitude,
    lng: loc.longitude,
    accuracyM: loc.horizontal_accuracy ?? undefined,
    source: "telegram",
    updatedAt: Date.now(),
  };
}

function fromGeo(p: GeolocationPosition): LivePosition {
  return {
    lat: p.coords.latitude,
    lng: p.coords.longitude,
    accuracyM: p.coords.accuracy,
    source: "browser",
    updatedAt: Date.now(),
  };
}

export function useLiveLocation(active: boolean) {
  const [status, setStatus] = useState<LiveLocationStatus>("idle");
  const [position, setPosition] = useState<LivePosition | null>(() => readCachedPosition());
  const [platformHint, setPlatformHint] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const grantedRef = useRef(sessionStorage.getItem(GRANTED_KEY) === "1");

  const applyPosition = useCallback((pos: LivePosition) => {
    setPosition(pos);
    cachePosition(pos);
    setStatus("active");
    sessionStorage.setItem(GRANTED_KEY, "1");
    grantedRef.current = true;
  }, []);

  const clearBrowserWatch = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const clearPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startBrowserWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      setPlatformHint("This browser has no GPS. Open Tugende on your phone in Telegram.");
      return;
    }
    clearBrowserWatch();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => applyPosition(fromGeo(p)),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setPlatformHint("Location blocked. Allow location for this site in browser or Telegram settings.");
        } else {
          setStatus("unavailable");
          setPlatformHint("Could not read GPS. Move outdoors or try again.");
        }
      },
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 20000 }
    );
  }, [applyPosition, clearBrowserWatch]);

  const refreshTelegramOnce = useCallback(async () => {
    const lm = await initTelegramLocationManager();
    if (!lm) return false;
    if (!lm.isLocationAvailable) {
      setStatus("unavailable");
      setPlatformHint(
        "Telegram on this device has no GPS (common on desktop). Use the Telegram app on your phone for live rides."
      );
      return false;
    }
    if (!lm.isAccessGranted) {
      setStatus("denied");
      return false;
    }
    const loc = await readTelegramLocation(lm);
    if (!loc) {
      setStatus("denied");
      return false;
    }
    applyPosition(fromTg(loc));
    return true;
  }, [applyPosition]);

  const startTelegramPolling = useCallback(async () => {
    const ok = await refreshTelegramOnce();
    if (!ok) return;
    clearPoll();
    pollRef.current = setInterval(() => {
      void refreshTelegramOnce();
    }, 8000);
  }, [clearPoll, refreshTelegramOnce]);

  const resumeTracking = useCallback(async () => {
    setStatus("starting");
    setPlatformHint(null);
    const lm = getTelegramLocationManager();
    if (lm) {
      await initTelegramLocationManager();
      const manager = getTelegramLocationManager();
      if (manager?.isAccessGranted) {
        await startTelegramPolling();
        return true;
      }
    }
    if (grantedRef.current && navigator.geolocation) {
      startBrowserWatch();
      return true;
    }
    setStatus("idle");
    return false;
  }, [startBrowserWatch, startTelegramPolling]);

  const enableLocation = useCallback(() => {
    void (async () => {
      setStatus("starting");
      setPlatformHint(null);
      if (await resumeTracking()) return;

      const lm = getTelegramLocationManager();
      if (lm) {
        await initTelegramLocationManager();
        const manager = getTelegramLocationManager();
        if (!manager?.isLocationAvailable) {
          setStatus("unavailable");
          setPlatformHint(
            "No GPS on this Telegram client. Open PluPatriot → Tugende on your Android or iPhone."
          );
          return;
        }
        manager.openSettings();
        setPlatformHint("Tap Allow in Telegram’s location dialog, then tap Refresh location.");
        setStatus("denied");
        return;
      }
      startBrowserWatch();
    })();
  }, [resumeTracking, startBrowserWatch]);

  const retryAfterSettings = useCallback(() => {
    void (async () => {
      const lm = await initTelegramLocationManager();
      if (lm?.isAccessGranted) {
        await startTelegramPolling();
        return;
      }
      if (lm) {
        lm.openSettings();
        setStatus("denied");
        setPlatformHint("After you tap Allow, press Refresh location.");
        return;
      }
      startBrowserWatch();
    })();
  }, [startBrowserWatch, startTelegramPolling]);

  useEffect(() => {
    if (!active) {
      clearBrowserWatch();
      clearPoll();
      return;
    }
    if (grantedRef.current) {
      void resumeTracking();
    }
    return () => {
      clearBrowserWatch();
      clearPoll();
    };
  }, [active, clearBrowserWatch, clearPoll, resumeTracking]);

  useEffect(() => {
    if (!active || status !== "active") return;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const lm = getTelegramLocationManager();
      if (lm?.isAccessGranted) void refreshTelegramOnce();
      else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (p) => applyPosition(fromGeo(p)),
          () => {},
          { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
        );
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [active, applyPosition, refreshTelegramOnce, status]);

  return {
    position,
    status,
    platformHint,
    enableLocation,
    retryAfterSettings,
    isTracking: status === "active" || status === "starting",
  };
}
