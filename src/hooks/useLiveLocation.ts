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

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 3000,
  timeout: 25000,
};

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
  const [status, setStatus] = useState<LiveLocationStatus>(() =>
    readCachedPosition() ? "active" : "idle"
  );
  const [position, setPosition] = useState<LivePosition | null>(() => readCachedPosition());
  const [platformHint, setPlatformHint] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const tgPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const grantWaitRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStartedRef = useRef(false);

  const applyPosition = useCallback((pos: LivePosition) => {
    setPosition(pos);
    cachePosition(pos);
    setStatus("active");
    setPlatformHint(null);
    sessionStorage.setItem(GRANTED_KEY, "1");
  }, []);

  const clearBrowserWatch = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const clearTgPoll = useCallback(() => {
    if (tgPollRef.current) {
      clearInterval(tgPollRef.current);
      tgPollRef.current = null;
    }
  }, []);

  const clearGrantWait = useCallback(() => {
    if (grantWaitRef.current) {
      clearInterval(grantWaitRef.current);
      grantWaitRef.current = null;
    }
  }, []);

  const readBrowserOnce = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => applyPosition(fromGeo(p)),
      () => {},
      { ...GEO_OPTIONS, maximumAge: 0 }
    );
  }, [applyPosition]);

  const startBrowserWatch = useCallback(() => {
    if (!navigator.geolocation) return false;
    clearBrowserWatch();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => applyPosition(fromGeo(p)),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus((s) => (s === "active" ? s : "denied"));
          setPlatformHint("Tap Allow location access, or enable location for PluPatriot in phone settings.");
        }
      },
      GEO_OPTIONS
    );
    return true;
  }, [applyPosition, clearBrowserWatch]);

  const readTelegram = useCallback(
    async (opts?: { soft?: boolean }) => {
      const lm = await initTelegramLocationManager();
      if (!lm?.isLocationAvailable) return false;
      if (!lm.isAccessGranted) {
        if (!opts?.soft) {
          setStatus((s) => (s === "active" ? s : "starting"));
        }
        return false;
      }
      const loc = await readTelegramLocation(lm);
      if (!loc) return false;
      applyPosition(fromTg(loc));
      return true;
    },
    [applyPosition]
  );

  const startTelegramPolling = useCallback(async () => {
    const ok = await readTelegram();
    if (!ok) return;
    clearTgPoll();
    tgPollRef.current = setInterval(() => {
      void readTelegram({ soft: true });
    }, 4000);
  }, [clearTgPoll, readTelegram]);

  const startGrantWaitPoll = useCallback(() => {
    clearGrantWait();
    let attempts = 0;
    grantWaitRef.current = setInterval(() => {
      attempts += 1;
      const lm = getTelegramLocationManager();
      if (lm?.isAccessGranted) {
        clearGrantWait();
        void startTelegramPolling();
        readBrowserOnce();
        return;
      }
      if (attempts >= 60) {
        clearGrantWait();
        setPlatformHint("If you tapped Allow, press Refresh location.");
      }
    }, 1500);
  }, [clearGrantWait, readBrowserOnce, startTelegramPolling]);

  const connectAll = useCallback(
    async (opts?: { openTelegramSettings?: boolean }) => {
      setStatus("starting");
      setPlatformHint(null);

      startBrowserWatch();
      readBrowserOnce();

      const lm = await initTelegramLocationManager();
      if (lm?.isAccessGranted) {
        await startTelegramPolling();
        return;
      }

      if (lm?.isLocationAvailable) {
        if (opts?.openTelegramSettings) {
          lm.openSettings();
          setPlatformHint("Tap Allow in Telegram, then wait a moment — your map should update.");
          startGrantWaitPoll();
        }
        return;
      }

      if (!navigator.geolocation) {
        setStatus("unavailable");
        setPlatformHint("Open Tugende in the Telegram app on your phone for GPS.");
      }
    },
    [readBrowserOnce, startBrowserWatch, startGrantWaitPoll, startTelegramPolling]
  );

  const enableLocation = useCallback(() => {
    void connectAll({ openTelegramSettings: true });
  }, [connectAll]);

  const retryAfterSettings = useCallback(() => {
    void (async () => {
      setStatus("starting");
      const ok = await readTelegram();
      if (ok) {
        await startTelegramPolling();
        return;
      }
      readBrowserOnce();
      startBrowserWatch();
      const lm = getTelegramLocationManager();
      if (lm && !lm.isAccessGranted) {
        lm.openSettings();
        startGrantWaitPoll();
      }
    })();
  }, [readBrowserOnce, readTelegram, startBrowserWatch, startGrantWaitPoll, startTelegramPolling]);

  useEffect(() => {
    if (!active) {
      autoStartedRef.current = false;
      clearBrowserWatch();
      clearTgPoll();
      clearGrantWait();
      return;
    }
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    void connectAll({ openTelegramSettings: false });
    return () => {
      clearBrowserWatch();
      clearTgPoll();
      clearGrantWait();
    };
  }, [active, clearBrowserWatch, clearGrantWait, clearTgPoll, connectAll]);

  useEffect(() => {
    if (!active || status !== "active") return;
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      readBrowserOnce();
      void readTelegram({ soft: true });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [active, readBrowserOnce, readTelegram, status]);

  return {
    position,
    status,
    platformHint,
    enableLocation,
    retryAfterSettings,
    isTracking: status === "active" || status === "starting",
  };
}
