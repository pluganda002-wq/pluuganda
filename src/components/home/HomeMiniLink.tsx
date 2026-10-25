import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type Props = {
  to: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
};

export function HomeMiniLink({ to, title, subtitle, icon }: Props) {
  return (
    <Link to={to} className="home-mini-link">
      <span className="home-mini-link__icon">{icon}</span>
      <span className="home-mini-link__body">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </span>
      <ChevronRight size={16} className="home-mini-link__chev" aria-hidden />
    </Link>
  );
}
