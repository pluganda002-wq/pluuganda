import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { DutyConfigProvider } from "@/context/DutyConfigContext";
import { ServiceContentProvider } from "@/context/ServiceContentContext";
import {
  AdminDutiesPage,
  AssistantPage,
  BuyUgandaPage,
  CharityPage,
  CsrPage,
  DigitalDutyPage,
  EducationPage,
  EndorsePage,
  EndorsePassPage,
  FieldDutyPage,
  GuildPage,
  HomePage,
  IntegrityPage,
  LeadershipPage,
  MembershipPage,
  MobilityPage,
  PluTvPage,
  ProgrammeDetailPage,
  ProgrammesPage,
  ProjectsPage,
  ReportPage,
  ServicesPage,
  SocialPage,
  TasksPage,
  TourismPage,
  TourismRegionPage,
  CharityDrivePage,
  AdminServicesPage,
  TugendePage,
  UgoPage,
  YouthPage,
} from "@/lazyPages";
import "@/components/ProfileEditorSheet.css";
import "@/components/accountability/DutyVerificationDesk.css";
import "@/components/ServiceTile.css";
import "@/styles/global.css";
import "@/styles/institutional.css";
import "@/styles/sections.css";

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
      <DutyConfigProvider>
      <ServiceContentProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/programmes" element={<ProgrammesPage />} />
            <Route path="/programmes/tasks/duty/:dutyId" element={<DigitalDutyPage />} />
            <Route path="/programmes/tasks/field/:dutyId" element={<FieldDutyPage />} />
            <Route path="/admin/duties" element={<AdminDutiesPage />} />
            <Route path="/programmes/tasks" element={<TasksPage />} />
            <Route path="/programmes/:slug" element={<ProgrammeDetailPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/profile" element={<GuildPage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/endorse" element={<EndorsePage />} />
            <Route path="/endorse/pass" element={<EndorsePassPage />} />
            <Route path="/integrity" element={<IntegrityPage />} />
            <Route path="/integrity/report" element={<ReportPage />} />
            <Route path="/youth" element={<YouthPage />} />
            <Route path="/charity" element={<CharityPage />} />
            <Route path="/csr" element={<CsrPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<Navigate to="/programmes/tasks" replace />} />
            <Route path="/leadership" element={<LeadershipPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/mobility" element={<MobilityPage />} />
            <Route path="/ugo" element={<UgoPage />} />
            <Route path="/tugende" element={<TugendePage />} />
            <Route path="/tourism" element={<TourismPage />} />
            <Route path="/tourism/region/:regionId" element={<TourismRegionPage />} />
            <Route path="/charity/:driveId" element={<CharityDrivePage />} />
            <Route path="/admin/services" element={<AdminServicesPage />} />
            <Route path="/buy-uganda" element={<BuyUgandaPage />} />
            <Route path="/tv" element={<PluTvPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/hub" element={<Navigate to="/services" replace />} />
            <Route path="/earn" element={<Navigate to="/" replace />} />
            <Route path="/boost" element={<Navigate to="/" replace />} />
            <Route path="/friends" element={<Navigate to="/" replace />} />
            <Route path="/wallet" element={<Navigate to="/profile" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </ServiceContentProvider>
      </DutyConfigProvider>
      </UserProvider>
    </ThemeProvider>
  );
}