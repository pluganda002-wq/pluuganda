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

function isGrantedPersisted(): boolean {
  try {
    return localStorage.getItem(GRANTED_KEY) === "1" || sessionStorage.getItem(GRANTED_KEY) === "1";
  } catch {
    return false;
  }
}

function persistGranted() {
  try {
    localStorage.setItem(GRANTED_KEY, "1");
    sessionStorage.setItem(GRANTED_KEY, "1");
  } catch {
    /* ignore */
  }
}

function readStoredPosition(): LivePosition | null {
  for (const store of [localStorage, sessionStorage]) {
    try {
      const raw = store.getItem(LAST_POS_KEY);
      if (!raw) continue;
      const pos = JSON.parse(raw) as LivePosition;
      if (typeof pos.lat === "number" && typeof pos.lng === "number") return pos;
    } catch {
      /* try next */
    }
  }
  return null;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 3000,
  timeout: 25000,
};

function cachePosition(pos: LivePosition) {
  const raw = JSON.stringify(pos);
  try {
    localStorage.setItem(LAST_POS_KEY, raw);
    sessionStorage.setItem(LAST_POS_KEY, raw);
  } catch {
    /* ignore */
  }
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

function telegramLocationAvailable(): boolean {
  return Boolean(getTelegramLocationManager()?.isLocationAvailable);
}

/** Prefer phone GPS from Telegram over coarse browser/IP geolocation in the mini app. */
function shouldApplyPosition(incoming: LivePosition, current: LivePosition | null): boolean {
  if (!current) return true;
  if (incoming.source === "telegram" && current.source === "browser") return true;
  if (incoming.source === "browser" && current.source === "telegram") {
    const telegramAgeMs = Date.now() - current.updatedAt;
    if (telegramAgeMs < 120_000) return false;
    const inAcc = incoming.accuracyM ?? 9999;
    const curAcc = current.accuracyM ?? 9999;
    if (inAcc > curAcc * 1.5) return false;
  }
  return incoming.updatedAt >= current.updatedAt - 500;
}

export function useLiveLocation(active: boolean) {
  const [status, setStatus] = useState<LiveLocationStatus>(() => {
    if (readStoredPosition()) return "active";
    if (isGrantedPersisted()) return "starting";
    return "idle";
  });
  const [position, setPosition] = useState<LivePosition | null>(() => readStoredPosition());
  const [platformHint, setPlatformHint] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const tgPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const grantWaitRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStartedRef = useRef(false);

  const applyPosition = useCallback((pos: LivePosition) => {
    setPosition((current) => {
      if (!shouldApplyPosition(pos, current)) return current;
      cachePosition(pos);
      return pos;
    });
    setStatus("active");
    setPlatformHint(null);
    persistGranted();
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
        persistGranted();
        clearGrantWait();
        void startTelegramPolling();
        return;
      }
      if (attempts >= 60) {
        clearGrantWait();
        setPlatformHint("If you tapped Allow, press Refresh location.");
      }
    }, 1500);
  }, [clearGrantWait, readBrowserOnce, startTelegramPolling]);

  const startBrowserFallback = useCallback(() => {
    startBrowserWatch();
    readBrowserOnce();
  }, [readBrowserOnce, startBrowserWatch]);

  const connectAll = useCallback(
    async (opts?: { openTelegramSettings?: boolean }) => {
      setStatus("starting");
      setPlatformHint(null);

      const lm = await initTelegramLocationManager();
      if (lm?.isAccessGranted) {
        persistGranted();
        await startTelegramPolling();
        return;
      }

      if (lm?.isLocationAvailable) {
        const askTelegram = opts?.openTelegramSettings && !isGrantedPersisted();
        if (askTelegram) {
          lm.openSettings();
          setPlatformHint("Tap Allow in Telegram, then wait a moment — your map should update.");
          startGrantWaitPoll();
        } else {
          startBrowserFallback();
          void readTelegram({ soft: true });
          if (isGrantedPersisted()) {
            startGrantWaitPoll();
          }
        }
        return;
      }

      if (navigator.geolocation) {
        startBrowserFallback();
        return;
      }

      setStatus("unavailable");
      setPlatformHint("Open Tugende in the Telegram app on your phone for GPS.");
    },
    [startBrowserFallback, startGrantWaitPoll, startTelegramPolling]
  );

  const enableLocation = useCallback(() => {
    void connectAll({ openTelegramSettings: !isGrantedPersisted() });
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
      if (lm && !lm.isAccessGranted && !isGrantedPersisted()) {
        lm.openSettings();
        startGrantWaitPoll();
      } else if (lm && !lm.isAccessGranted) {
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
    telegramPreferred: telegramLocationAvailable(),
    locationGranted: isGrantedPersisted() || status === "active",
  };
}

export function isTugendeLocationGranted(): boolean {
  return isGrantedPersisted();
}

export function clearLiveLocationCache() {
  try {
    localStorage.removeItem(LAST_POS_KEY);
    localStorage.removeItem(GRANTED_KEY);
    sessionStorage.removeItem(LAST_POS_KEY);
    sessionStorage.removeItem(GRANTED_KEY);
  } catch {
    /* ignore */
  }
}
