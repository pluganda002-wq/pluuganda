import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDutyTasks } from "@/context/DutyConfigContext";
import { readReturnTo } from "@/lib/dutyNavigation";
import { BottomNav } from "./BottomNav";
import { InstitutionalTopBar } from "./InstitutionalTopBar";
import { SubPageBar } from "./SubPageBar";

const MAIN_TABS = new Set(["/", "/programmes", "/services", "/social", "/profile"]);

const SUBPAGE_BAR: Record<string, { title: string; backTo?: string }> = {
  "/ugo": { title: "UGo Ride", backTo: "/" },
  "/integrity": { title: "Projects dashboard", backTo: "/programmes" },
  "/integrity/report": { title: "Civic accountability watch", backTo: "/integrity" },
  "/programmes/tasks": { title: "Duty verification desk", backTo: "/programmes" },
  "/admin/duties": { title: "Duty administration", backTo: "/services" },
  "/tv": { title: "PLU TV", backTo: "/services" },
  "/education": { title: "Civic education", backTo: "/services" },
  "/youth": { title: "Youth leagues & forums", backTo: "/services" },
  "/tourism": { title: "Tourism", backTo: "/services" },
  "/admin/services": { title: "Services content", backTo: "/services" },
  "/endorse": { title: "Public endorsement", backTo: "/services" },
  "/endorse/pass": { title: "Endorsement pass", backTo: "/profile" },
};

const MAIN_TAB_TITLES: Record<string, string> = {
  "/social": "Social",
  "/programmes": "Active audit desk",
  "/services": "Services",
  "/profile": "Guild",
};

function resolveSubPageBar(
  pathname: string,
  dutyTasks: { id: string; title: string }[],
  returnTo?: string
): { title: string; backTo?: string } | null {
  const dutyMatch = pathname.match(/^\/programmes\/tasks\/duty\/([^/]+)$/);
  if (dutyMatch) {
    const task = dutyTasks.find((t) => t.id === dutyMatch[1]);
    return {
      title: task?.title ?? "Digital duty",
      backTo: returnTo ?? "/programmes/tasks?tab=digital",
    };
  }

  const fieldMatch = pathname.match(/^\/programmes\/tasks\/field\/([^/]+)$/);
  if (fieldMatch) {
    return {
      title: "Field verification",
      backTo: returnTo ?? "/programmes/tasks?tab=field",
    };
  }

  if (pathname.match(/^\/tourism\/region\/[^/]+$/)) {
    return { title: "Explore theme", backTo: "/tourism" };
  }

  if (pathname.match(/^\/charity\/[^/]+$/)) {
    return { title: "Charity drive", backTo: "/charity" };
  }

  const fixed = SUBPAGE_BAR[pathname];
  if (fixed) {
    return { ...fixed, backTo: returnTo ?? fixed.backTo };
  }

  if (returnTo && MAIN_TABS.has(pathname)) {
    return { title: MAIN_TAB_TITLES[pathname] ?? "PLU", backTo: returnTo };
  }

  if (!MAIN_TABS.has(pathname)) {
    return { title: MAIN_TAB_TITLES[pathname] ?? "PLU", backTo: returnTo };
  }

  return null;
}

export function AppShell() {
  const { pathname, state } = useLocation();
  const dutyTasks = useDutyTasks();
  const returnTo = readReturnTo(state);
  const isMainTab = MAIN_TABS.has(pathname);
  const subpageBar = resolveSubPageBar(pathname, dutyTasks, returnTo);
  const useInstitutional = isMainTab && !subpageBar;

  return (
    <div className="app-shell app-shell--institutional">
      <div className="app-frame">
        <div className="app-frame__main">
          {useInstitutional ? <InstitutionalTopBar pathname={pathname} /> : null}
          {!useInstitutional ? (
            <SubPageBar title={subpageBar?.title} backTo={subpageBar?.backTo} />
          ) : null}
          <Suspense
            fallback={
              <main className="page route-loading" aria-busy="true" aria-live="polite">
                <p className="route-loading__text">Loading…</p>
              </main>
            }
          >
            <Outlet />
          </Suspense>
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
