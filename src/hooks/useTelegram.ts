import { useEffect, useMemo } from "react";
import WebApp from "@twa-dev/sdk";

export function useTelegram() {
  const user = WebApp.initDataUnsafe.user;

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor("#1a1a1a");
    WebApp.setBackgroundColor("#1a1a1a");
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "Patriot";
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.first_name ?? user.username ?? "Patriot";
  }, [user]);

  return {
    user,
    displayName,
    webApp: WebApp,
    haptic: (type: "light" | "medium" | "heavy" = "light") => {
      if (WebApp.HapticFeedback) WebApp.HapticFeedback.impactOccurred(type);
    },
    showAlert: (message: string) => WebApp.showAlert(message),
  };
}
