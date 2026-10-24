import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { SubPageBar } from "./SubPageBar";

const MAIN_TABS = new Set(["/", "/programmes", "/services", "/social", "/profile"]);

export function AppShell() {
  const { pathname } = useLocation();
  const isMainTab = MAIN_TABS.has(pathname);

  return (
    <div className="app-shell">
      {!isMainTab ? <SubPageBar /> : null}
      <Outlet />
      <BottomNav />
    </div>
  );
}
