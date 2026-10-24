import { Home, Layers, LayoutGrid, MessageCircle, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import "./BottomNav.css";

const items = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/programmes", label: "Programmes", icon: Layers, end: false },
  { to: "/services", label: "Services", icon: LayoutGrid, end: false },
  { to: "/social", label: "Social", icon: MessageCircle, end: false },
  { to: "/profile", label: "Profile", icon: User, end: false },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `bottom-nav__item${isActive ? " bottom-nav__item--active" : ""}`
          }
        >
          <Icon size={22} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
