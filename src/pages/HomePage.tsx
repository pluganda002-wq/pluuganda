import {
  Bot,
  Car,
  GraduationCap,
  Heart,
  ShieldAlert,
  Sparkles,
  Tv,
  UserPlus,
  Vote,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ModuleCard } from "@/components/ModuleCard";
import { StatGrid } from "@/components/StatGrid";
import { PLU_STATS, PLU_TAGLINE, PLU_VALUES } from "@/data/plu";
import { useTelegram } from "@/hooks/useTelegram";
import "./HomePage.css";

export function HomePage() {
  const { displayName } = useTelegram();

  return (
    <main className="page home-page">
      <section className="hero">
        <div className="hero__brand">
          <div className="hero__logo" aria-hidden>
            PLU
          </div>
          <div>
            <p className="hero__greeting">Karibu, {displayName}</p>
            <h1 className="hero__title">PLU BOT</h1>
            <p className="hero__tagline">{PLU_TAGLINE}</p>
          </div>
        </div>

        <div className="hero__stats">
          <StatGrid
            stats={[
              { label: "Endorsements", value: PLU_STATS.endorsements },
              { label: "Districts", value: PLU_STATS.districts },
              { label: "Members", value: PLU_STATS.members },
            ]}
          />
        </div>
      </section>

      <section className="home-section">
        <h2 className="section-title">Start here</h2>
        <div className="home-section__actions">
          <Link to="/membership" className="btn btn-primary">
            <UserPlus size={18} />
            Register membership
          </Link>
          <Link to="/endorse" className="btn btn-secondary">
            <Vote size={18} />
            Add endorsement
          </Link>
          <Link to="/assistant" className="btn btn-secondary">
            <Bot size={18} />
            PLU Assistant
          </Link>
        </div>
      </section>

      <section className="home-section">
        <h2 className="section-title">Integrity & programmes</h2>
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
        <h2 className="section-title">Mobility & media</h2>
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
        <h2 className="section-title">Our mission</h2>
        <ul className="values-strip">
          {PLU_VALUES.map((v) => (
            <li key={v.title}>
              <strong>{v.title}</strong>
              <span>{v.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
