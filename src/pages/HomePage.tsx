import {
  Bot,
  Car,
  GraduationCap,
  Heart,
  MapPin,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Tv,
  UserPlus,
  Vote,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ModuleCard } from "@/components/ModuleCard";
import { SectionHead } from "@/components/SectionHead";
import { StatGrid } from "@/components/StatGrid";
import { PLU_STATS, PLU_TAGLINE, PLU_VALUES } from "@/data/plu";
import { useTelegram } from "@/hooks/useTelegram";
import "./HomePage.css";

const HERO_BANNER = "/branding/plu-hero-banner.png";
const SERVICE_ICON = "/branding/plu-service-points-icon.png";

export function HomePage() {
  const { displayName } = useTelegram();

  return (
    <main className="institutional-page home-page">
      <section className="home-hero" aria-label="Patriotic League of Uganda">
        <div className="home-hero__frame">
          <img
            src={HERO_BANNER}
            alt="Patriotism is a Duty — Patriotic League of Uganda"
            className="home-hero__img"
            width={1200}
            height={630}
            decoding="async"
          />
        </div>
        <div className="home-hero__welcome">
          <img src={SERVICE_ICON} alt="" className="home-hero__icon" width={104} height={104} />
          <div className="home-hero__text">
            <p className="hero__greeting">Karibu, {displayName}</p>
            <h1 className="hero__title">PLU BOT</h1>
            <p className="hero__tagline">{PLU_TAGLINE}</p>
          </div>
        </div>
      </section>

      <div className="institutional-page__body home-page__body">
        <div className="hero__stats card card--flat">
          <StatGrid
            stats={[
              { label: "Endorsements", value: PLU_STATS.endorsements },
              { label: "Districts", value: PLU_STATS.districts },
              { label: "Members", value: PLU_STATS.members },
            ]}
          />
        </div>

        <section className="home-section">
          <SectionHead title="Start here" subtitle="Membership, endorsements and help — one tap away." />
          <div className="home-section__actions">
            <Link to="/membership" className="btn btn-primary">
              <UserPlus size={18} />
              Register membership
            </Link>
            <div className="btn-grid-2">
              <Link to="/endorse" className="btn btn-secondary">
                <Vote size={18} />
                Endorse
              </Link>
              <Link to="/assistant" className="btn btn-secondary">
                <Bot size={18} />
                Assistant
              </Link>
            </div>
          </div>
        </section>

        <section className="home-section">
          <SectionHead title="Integrity & programmes" />
          <div className="module-list">
            <ModuleCard
              to="/integrity"
              title="Fight corruption"
              subtitle="Secure reporting and public case tracking"
              icon={<ShieldAlert size={22} />}
              accent="red"
            />
            <ModuleCard
              to="/programmes"
              title="All programmes"
              subtitle="Barazas, youth, service, diaspora and accountability"
              icon={<Sparkles size={22} />}
              accent="green"
            />
          </div>
        </section>

        <section className="home-section">
          <SectionHead title="Tourism & Buy Uganda" />
          <div className="module-list">
            <ModuleCard
              to="/tourism"
              title="Tourism"
              subtitle="Pearl of Africa — parks, culture, adventure and PLU travel"
              icon={<MapPin size={22} />}
              accent="green"
            />
            <ModuleCard
              to="/buy-uganda"
              title="Buy Uganda, Build Uganda"
              subtitle="Shop local, list your business, grow the economy"
              icon={<ShoppingBag size={22} />}
              accent="gold"
            />
          </div>
        </section>

        <section className="home-section">
          <SectionHead title="Mobility & media" />
          <div className="module-list">
            <ModuleCard
              to="/mobility"
              title="UGo Ride & Tugende"
              subtitle="Mobility partners and transport hubs"
              icon={<Car size={22} />}
              accent="blue"
            />
            <ModuleCard
              to="/tv"
              title="PLU TV"
              subtitle="Official updates and educational streams"
              icon={<Tv size={22} />}
              accent="gold"
            />
            <ModuleCard
              to="/education"
              title="Civic education"
              subtitle="Citizenship, unity and public stewardship"
              icon={<GraduationCap size={22} />}
              accent="green"
            />
            <ModuleCard
              to="/charity"
              title="Charity & CSR"
              subtitle="Community projects and partnerships"
              icon={<Heart size={22} />}
              accent="red"
            />
          </div>
        </section>

        <section className="home-section home-section--values">
          <SectionHead title="Our mission" />
          <ul className="values-strip">
            {PLU_VALUES.map((v) => (
              <li key={v.title}>
                <strong>{v.title}</strong>
                <span>{v.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
