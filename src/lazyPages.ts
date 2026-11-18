import { lazy, type ComponentType } from "react";

function lazyPage<P extends Record<string, ComponentType<object>>>(
  loader: () => Promise<P>,
  exportName: keyof P & string
) {
  return lazy(() => loader().then((mod) => ({ default: mod[exportName] as ComponentType<object> })));
}

export const HomePage = lazyPage(() => import("@/pages/HomePage"), "HomePage");
export const ProgrammesPage = lazyPage(() => import("@/pages/ProgrammesPage"), "ProgrammesPage");
export const DigitalDutyPage = lazyPage(() => import("@/pages/DigitalDutyPage"), "DigitalDutyPage");
export const FieldDutyPage = lazyPage(() => import("@/pages/FieldDutyPage"), "FieldDutyPage");
export const AdminDutiesPage = lazyPage(() => import("@/pages/AdminDutiesPage"), "AdminDutiesPage");
export const TasksPage = lazyPage(() => import("@/pages/TasksPage"), "TasksPage");
export const ProgrammeDetailPage = lazyPage(() => import("@/pages/ProgrammeDetailPage"), "ProgrammeDetailPage");
export const ServicesPage = lazyPage(() => import("@/pages/ServicesPage"), "ServicesPage");
export const SocialPage = lazyPage(() => import("@/pages/SocialPage"), "SocialPage");
export const GuildPage = lazyPage(() => import("@/pages/GuildPage"), "GuildPage");
export const MembershipPage = lazyPage(() => import("@/pages/MembershipPage"), "MembershipPage");
export const EndorsePage = lazyPage(() => import("@/pages/EndorsePage"), "EndorsePage");
export const EndorsePassPage = lazyPage(() => import("@/pages/EndorsePassPage"), "EndorsePassPage");
export const IntegrityPage = lazyPage(() => import("@/pages/IntegrityPage"), "IntegrityPage");
export const ReportPage = lazyPage(() => import("@/pages/ReportPage"), "ReportPage");
export const YouthPage = lazyPage(() => import("@/pages/YouthPage"), "YouthPage");
export const CharityPage = lazyPage(() => import("@/pages/CharityPage"), "CharityPage");
export const CsrPage = lazyPage(() => import("@/pages/CsrPage"), "CsrPage");
export const ProjectsPage = lazyPage(() => import("@/pages/ProjectsPage"), "ProjectsPage");
export const LeadershipPage = lazyPage(() => import("@/pages/LeadershipPage"), "LeadershipPage");
export const EducationPage = lazyPage(() => import("@/pages/EducationPage"), "EducationPage");
export const MobilityPage = lazyPage(() => import("@/pages/MobilityPage"), "MobilityPage");
export const UgoPage = lazyPage(() => import("@/pages/UgoPage"), "UgoPage");
export const TugendePage = lazyPage(() => import("@/pages/TugendePage"), "TugendePage");
export const TourismPage = lazyPage(() => import("@/pages/TourismPage"), "TourismPage");
export const TourismRegionPage = lazyPage(() => import("@/pages/TourismRegionPage"), "TourismRegionPage");
export const CharityDrivePage = lazyPage(() => import("@/pages/CharityDrivePage"), "CharityDrivePage");
export const AdminServicesPage = lazyPage(() => import("@/pages/AdminServicesPage"), "AdminServicesPage");
export const BuyUgandaPage = lazyPage(() => import("@/pages/BuyUgandaPage"), "BuyUgandaPage");
export const PluTvPage = lazyPage(() => import("@/pages/PluTvPage"), "PluTvPage");
export const AssistantPage = lazyPage(() => import("@/pages/AssistantPage"), "AssistantPage");