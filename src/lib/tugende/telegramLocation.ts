export type TgLocationData = {
  latitude: number;
  longitude: number;
  horizontal_accuracy?: number | null;
};

type TgLocationManager = {
  isInited: boolean;
  isLocationAvailable: boolean;
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  init: (callback?: () => void) => TgLocationManager;
  getLocation: (callback: (location: TgLocationData | null) => void) => TgLocationManager;
  openSettings: () => TgLocationManager;
};

export function getTelegramLocationManager(): TgLocationManager | null {
  const tg = (window as unknown as { Telegram?: { WebApp?: { LocationManager?: TgLocationManager } } }).Telegram;
  return tg?.WebApp?.LocationManager ?? null;
}

export function initTelegramLocationManager(): Promise<TgLocationManager | null> {
  const lm = getTelegramLocationManager();
  if (!lm) return Promise.resolve(null);
  if (lm.isInited) return Promise.resolve(lm);
  return new Promise((resolve) => {
    lm.init(() => resolve(lm));
  });
}

export function readTelegramLocation(lm: TgLocationManager): Promise<TgLocationData | null> {
  return new Promise((resolve) => {
    lm.getLocation((location) => resolve(location));
  });
}
