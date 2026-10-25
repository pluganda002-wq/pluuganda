import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { BottomNav } from "./BottomNav";
import { InstitutionalTopBar } from "./InstitutionalTopBar";
import { SubPageBar } from "./SubPageBar";

const MAIN_TABS = new Set(["/", "/programmes", "/services", "/social", "/profile"]);

export function AppShell() {
  const { pathname } = useLocation();
  const isMainTab = MAIN_TABS.has(pathname);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor("#000000");
    WebApp.setBackgroundColor("#8b6914");
  }, []);

  return (
    <div className="app-shell app-shell--institutional">
      <div className="app-frame">
        <div className="app-frame__main">
          {isMainTab ? <InstitutionalTopBar pathname={pathname} /> : null}
          {!isMainTab ? <SubPageBar /> : null}
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
