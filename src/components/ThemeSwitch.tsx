import { ThemeToggle } from "./ThemeToggle";

export function ThemeSwitch() {
  return (
    <div className="theme-switch">
      <div className="theme-switch__row">
        <p className="theme-switch__label">Appearance</p>
        <ThemeToggle />
      </div>
      <p className="theme-switch__note">Cream by default. Flip the switch for black &amp; gold.</p>
    </div>
  );
}
