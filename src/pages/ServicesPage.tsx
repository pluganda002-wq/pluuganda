import { useMemo, useState, type ReactNode } from "react";
import {
  Briefcase,
  Car,
  ClipboardList,
  GraduationCap,
  Heart,
  MapPin,
  ShieldAlert,
  ShoppingBag,
  Trophy,
  Tv,
  UserPlus,
  Users,
  Vote,
} from "lucide-react";
import { CategoryTabs } from "@/components/CategoryTabs";
import { PageHero } from "@/components/PageHero";
import { ServiceTile } from "@/components/ServiceTile";
import {
  SERVICE_CATEGORIES,
  SERVICE_ITEMS,
  type ServiceCategory,
  type ServiceItem,
} from "@/data/services";

const ICONS: Record<string, ReactNode> = {
  user: <UserPlus size={24} />,
  vote: <Vote size={24} />,
  shield: <ShieldAlert size={24} />,
  users: <Users size={24} />,
  map: <MapPin size={24} />,
  shop: <ShoppingBag size={24} />,
  heart: <Heart size={24} />,
  briefcase: <Briefcase size={24} />,
  tv: <Tv size={24} />,
  car: <Car size={24} />,
  grad: <GraduationCap size={24} />,
  clipboard: <ClipboardList size={24} />,
  tasks: <ClipboardList size={24} />,
  trophy: <Trophy size={24} />,
};

function ServiceIcon({ item }: { item: ServiceItem }) {
  return ICONS[item.iconKey] ?? <ClipboardList size={24} />;
}

export function ServicesPage() {
  const [category, setCategory] = useState<ServiceCategory>("all");

  const filtered = useMemo(
    () =>
      category === "all" ? SERVICE_ITEMS : SERVICE_ITEMS.filter((s) => s.category === category),
    [category]
  );

  return (
    <main className="institutional-page">
      <PageHero
        src="/branding/plu-services-hero.png"
        alt="Patriotism is a Duty — Serve, Contribute, Earn Points"
        caption="Points for verified positive actions — not political agreement alone."
      />

      <div className="institutional-page__body">
        <p className="institutional-page__lead">
          Official PLU digital services. Select a category, then open a service below.
        </p>

        <CategoryTabs
          tabs={SERVICE_CATEGORIES}
          active={category}
          onChange={setCategory}
          ariaLabel="Service categories"
        />

        <div className="inst-panel">
          <h2 className="inst-panel__title">Serve · Contribute · Earn</h2>
          <div className="service-grid">
            {filtered.map((item) => (
              <ServiceTile
                key={item.id}
                to={item.to}
                title={item.title}
                subtitle={item.subtitle}
                icon={<ServiceIcon item={item} />}
                accent={item.accent}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
