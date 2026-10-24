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
import { ModuleCard } from "@/components/ModuleCard";
import { PageHeader } from "@/components/PageHeader";

export function ServicesPage() {
  return (
    <main className="page">
      <PageHeader
        title="Services"
        subtitle="Membership, mobility, media, leadership, tasks and community programmes."
      />
      <div className="module-list">
        <ModuleCard
          to="/membership"
          title="Registration & verification"
          subtitle="Join PLU and verify your member record"
          icon={<UserPlus size={22} />}
        />
        <ModuleCard
          to="/endorse"
          title="Presidential endorsement"
          subtitle="Add your voice to the national campaign"
          icon={<Vote size={22} />}
        />
        <ModuleCard
          to="/integrity"
          title="Corruption reporting"
          subtitle="Secure reports and case tracker"
          icon={<ShieldAlert size={22} />}
          accent="red"
        />
        <ModuleCard
          to="/youth"
          title="Youth leagues"
          subtitle="Forums, leadership and service opportunities"
          icon={<Users size={22} />}
          accent="green"
        />
        <ModuleCard
          to="/charity"
          title="Charity programmes"
          subtitle="Community care and volunteer drives"
          icon={<Heart size={22} />}
          accent="red"
        />
        <ModuleCard
          to="/csr"
          title="Corporate social responsibility"
          subtitle="Partner with PLU on national development"
          icon={<Briefcase size={22} />}
          accent="blue"
        />
        <ModuleCard
          to="/projects"
          title="Citizen project reviews"
          subtitle="Review and feedback on community projects"
          icon={<ClipboardList size={22} />}
          accent="green"
        />
        <ModuleCard
          to="/tasks"
          title="Special tasks"
          subtitle="Patriotic missions and mobilisation tasks"
          icon={<ClipboardList size={22} />}
        />
        <ModuleCard
          to="/leadership"
          title="Leadership rankings"
          subtitle="Endorsements and service-based recognition"
          icon={<Trophy size={22} />}
          accent="gold"
        />
        <ModuleCard
          to="/education"
          title="Educational content"
          subtitle="Civic learning modules"
          icon={<GraduationCap size={22} />}
          accent="green"
        />
        <ModuleCard
          to="/tourism"
          title="Tourism"
          subtitle="Discover Uganda — organised travel and PLU packages"
          icon={<MapPin size={22} />}
          accent="green"
        />
        <ModuleCard
          to="/buy-uganda"
          title="Buy Uganda, Build Uganda"
          subtitle="Local suppliers, categories and business listings"
          icon={<ShoppingBag size={22} />}
          accent="gold"
        />
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
          subtitle="Streams and official broadcasts"
          icon={<Tv size={22} />}
        />
      </div>
    </main>
  );
}
