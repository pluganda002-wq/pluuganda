import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import "./ServiceTile.css";

type Props = {
  to: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  accent?: "gold" | "red" | "green" | "blue";
};

export function ServiceTile({ to, title, subtitle, icon, accent = "gold" }: Props) {
  return (
    <Link to={to} className={`service-tile service-tile--${accent}`}>
      <span className="service-tile__icon">{icon}</span>
      <span className="service-tile__title">{title}</span>
      <span className="service-tile__sub">{subtitle}</span>
    </Link>
  );
}
