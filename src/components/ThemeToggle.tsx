import { useTheme } from "@/context/ThemeContext";

type Props = {
  className?: string;
};

/** Off = cream (default). On = black & gold. No text labels — visual switch only. */
export function ThemeToggle({ className = "" }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isGold = theme === "patriot";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isGold}
      aria-label={
        isGold
          ? "Gold mode on. Switch to cream appearance."
          : "Cream mode. Switch to gold appearance."
      }
      className={`theme-toggle${isGold ? " theme-toggle--on" : ""}${className ? ` ${className}` : ""}`}
      onClick={toggleTheme}
    >
      <span className="theme-toggle__track" aria-hidden="true" />
      <span className="theme-toggle__thumb" aria-hidden="true" />
    </button>
  );
}
