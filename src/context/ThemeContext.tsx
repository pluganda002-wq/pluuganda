import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import WebApp from "@twa-dev/sdk";

export type PluTheme = "institutional" | "patriot";

const STORAGE_KEY = "plu-bot-theme-v1";

type ThemeContextValue = {
  theme: PluTheme;
  setTheme: (theme: PluTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const TG_COLORS: Record<
  PluTheme,
  { header: `#${string}`; background: `#${string}`; meta: string }
> = {
  institutional: {
    header: "#f5f5f0",
    background: "#1a1a10",
    meta: "#1a1a10",
  },
  patriot: {
    header: "#000000",
    background: "#8b6914",
    meta: "#8b6914",
  },
};

function loadTheme(): PluTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "patriot" || raw === "institutional") return raw;
  } catch {
    /* ignore */
  }
  return "institutional";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<PluTheme>(() => loadTheme());

  const setTheme = useCallback((next: PluTheme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "institutional" ? "patriot" : "institutional");
  }, [setTheme, theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const colors = TG_COLORS[theme];
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", colors.meta);
    try {
      WebApp.ready();
      WebApp.expand();
      WebApp.setHeaderColor(colors.header);
      WebApp.setBackgroundColor(colors.background);
    } catch {
      /* outside Telegram */
    }
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
