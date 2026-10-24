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
import { PLU_STATS, PLU_TAGLINE } from "@/data/plu";
import { useTelegram } from "@/hooks/useTelegram";
import "./HomePage.css";

export function HomePage() {
  const { displayName } = useTelegram();

  return (
    <main className="page">
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

        <div className="hero__actions">
          <Link to="/assistant" className="btn btn-primary">
            <Bot size={18} />
            Ask PLU Assistant
          </Link>
          <Link to="/endorse" className="btn btn-secondary">
            <Vote size={18} />
            Add your endorsement
          </Link>
        </div>
      </section>

      <h2 className="section-title">Quick access</h2>
      <div className="module-list">
        <ModuleCard
          to="/membership"
          title="Member registration"
          subtitle="Register, verify records and stay connected to PLU"
          icon={<UserPlus size={22} />}
          accent="gold"
        />
        <ModuleCard
          to="/integrity"
          title="Fight corruption"
          subtitle="Secure reporting and public case tracking"
          icon={<ShieldAlert size={22} />}
          accent="red"
        />
        <ModuleCard
          to="/programmes"
          title="Programmes"
          subtitle="Barazas, youth, service, diaspora and more"
          icon={<Sparkles size={22} />}
          accent="green"
        />
        <ModuleCard
          to="/mobility"
          title="Mobility & hubs"
          subtitle="UGo Ride, Tugende safe boda, transport coordination"
          icon={<Car size={22} />}
          accent="blue"
        />
        <ModuleCard
          to="/tv"
          title="PLU TV"
          subtitle="Official updates, events and educational streams"
          icon={<Tv size={22} />}
          accent="gold"
        />
        <ModuleCard
          to="/education"
          title="Civic education"
          subtitle="Learn citizenship, unity and responsible stewardship"
          icon={<GraduationCap size={22} />}
          accent="green"
        />
        <ModuleCard
          to="/charity"
          title="Charity & CSR"
          subtitle="Community projects and corporate social responsibility"
          icon={<Heart size={22} />}
          accent="red"
        />
      </div>
    </main>
  );
}
