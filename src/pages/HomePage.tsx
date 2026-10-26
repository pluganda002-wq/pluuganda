import {
  GraduationCap,
  Heart,
  MapPin,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Tv,
} from "lucide-react";
import { Link } from "react-router-dom";
import { HomeSectionPopup } from "@/components/home/HomeSectionPopup";
import { HomeMiniLink } from "@/components/home/HomeMiniLink";
import { ServicePointsCard } from "@/components/home/ServicePointsCard";
import { PLU_VALUES } from "@/data/plu";
import { useUser } from "@/context/UserContext";
import "./HomePage.css";

const HERO_BANNER = "/branding/plu-hero-banner.png";
const UGO_RIDE_LOGO = "/branding/ugo-ride.png";
const TUGENDE_LOGO = "/branding/tugende-safe-boda.png";

function useServicePointsTotal(): number {
  const { member, endorsed, completedTasks } = useUser();
  const activity = completedTasks.length * 25 + 10;
  const verified =
    (member ? 40 : 0) + (endorsed ? 35 : 0) + (member?.verified ? 50 : 0);
  return activity + verified;
}

export function HomePage() {
  const total = useServicePointsTotal();

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
        <ServicePointsCard total={total} />
      </section>

      <div className="institutional-page__body home-page__body">
        <section className="home-box home-mobility" aria-labelledby="home-mobility-title">
          <h2 id="home-mobility-title" className="home-static-bar">
            Mobility
          </h2>
          <div className="home-mobility__duo">
            <Link to="/mobility#ugo" className="home-mobility__tile">
              <img
                src={UGO_RIDE_LOGO}
                alt="UGo Ride"
                className="home-mobility__logo"
                width={88}
                height={88}
                loading="lazy"
              />
            </Link>
            <Link to="/tugende" className="home-mobility__tile">
              <img
                src={TUGENDE_LOGO}
                alt="Tugende Safe Boda"
                className="home-mobility__logo"
                width={88}
                height={88}
                loading="lazy"
              />
            </Link>
          </div>
        </section>

        <div className="home-dual">
          <HomeSectionPopup title="Integrity & programmes" className="home-dual__col">
            <div className="home-col-stack home-col-stack--wide">
              <HomeMiniLink
                to="/integrity"
                title="Fight corruption"
                subtitle="Report & track cases"
                icon={<ShieldAlert size={18} />}
              />
              <HomeMiniLink
                to="/programmes"
                title="All programmes"
                subtitle="Barazas, youth & accountability"
                icon={<Sparkles size={18} />}
              />
            </div>
          </HomeSectionPopup>

          <HomeSectionPopup title="Tourism & Buy Uganda" barVariant="teal" className="home-dual__col">
            <div className="home-col-stack home-col-stack--wide">
              <HomeMiniLink
                to="/tourism"
                title="Tourism"
                subtitle="Pearl of Africa"
                icon={<MapPin size={18} />}
              />
              <HomeMiniLink
                to="/buy-uganda"
                title="Buy Uganda"
                subtitle="Build Uganda — shop local"
                icon={<ShoppingBag size={18} />}
              />
            </div>
          </HomeSectionPopup>
        </div>

        <div className="home-dual">
          <HomeSectionPopup title="Civic" className="home-dual__col">
            <div className="home-col-stack home-col-stack--wide">
              <HomeMiniLink
                to="/education"
                title="Civic education"
                subtitle="Citizenship & stewardship"
                icon={<GraduationCap size={18} />}
              />
              <HomeMiniLink
                to="/charity"
                title="Charity"
                subtitle="Community projects"
                icon={<Heart size={18} />}
              />
              <HomeMiniLink
                to="/csr"
                title="CSR"
                subtitle="Partnerships & giving"
                icon={<Heart size={18} />}
              />
            </div>
          </HomeSectionPopup>

          <HomeSectionPopup title="PLU TV" barVariant="teal" className="home-dual__col">
            <div className="home-col-stack home-col-stack--wide">
              <HomeMiniLink
                to="/tv"
                title="PLU TV"
                subtitle="Official streams & updates"
                icon={<Tv size={18} />}
              />
              <HomeMiniLink
                to="/projects"
                title="Projects"
                subtitle="Citizen reviews"
                icon={<Sparkles size={18} />}
              />
              <HomeMiniLink
                to="/tasks"
                title="Tasks"
                subtitle="Missions & rewards"
                icon={<Sparkles size={18} />}
              />
            </div>
          </HomeSectionPopup>
        </div>

        <section className="home-box home-section--values" aria-labelledby="home-mission-title">
          <h2 id="home-mission-title" className="home-static-bar">
            Our mission
          </h2>
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
