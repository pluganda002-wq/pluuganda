const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/programmes": "Programmes",
  "/services": "Services",
  "/social": "Social",
  "/profile": "Profile",
};

type Props = {
  pathname: string;
};

export function InstitutionalTopBar({ pathname }: Props) {
  const title = PAGE_TITLES[pathname] ?? "PLU BOT";

  return (
    <header className="inst-topbar">
      <div className="inst-topbar__inner">
        <img
          src="/branding/plu-service-points-icon.png"
          alt=""
          className="inst-topbar__logo"
          width={36}
          height={36}
        />
        <div className="inst-topbar__text">
          <span className="inst-topbar__org">Patriotic League of Uganda</span>
          <span className="inst-topbar__page">{title}</span>
        </div>
      </div>
    </header>
  );
}
