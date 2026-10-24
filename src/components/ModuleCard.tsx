import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import "./ModuleCard.css";

type Accent = "gold" | "red" | "green" | "blue";

type Props = {
  to: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  accent?: Accent;
};

export function ModuleCard({ to, title, subtitle, icon, accent = "gold" }: Props) {
  return (
    <Link to={to} className={`module-card module-card--${accent}`}>
      <div className="module-card__icon">{icon}</div>
      <div className="module-card__body">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <ChevronRight size={18} className="module-card__chevron" aria-hidden />
    </Link>
  );
}
