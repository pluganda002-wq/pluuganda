/** Client-safe env (NEXT_PUBLIC_* and VITE_*). */
function read(key: string): string {
  const next = import.meta.env[`NEXT_PUBLIC_${key}`];
  if (typeof next === "string" && next.length > 0) return next;
  const vite = import.meta.env[`VITE_${key}`];
  if (typeof vite === "string" && vite.length > 0) return vite;
  return "";
}

export const publicEnv = {
  botUsername: () => read("BOT_USERNAME"),
  channelLink: () => read("CHANNEL_LINK"),
  bypassTelegramAuth: () => read("BYPASS_TELEGRAM_AUTH") === "true",
  tonAdsReceiver: () => read("TON_ADS_RECEIVER_ADDRESS"),
};
