import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { DutyConfigProvider } from "@/context/DutyConfigContext";
import { AssistantPage } from "@/pages/AssistantPage";
import { BuyUgandaPage } from "@/pages/BuyUgandaPage";
import { CharityPage } from "@/pages/CharityPage";
import { CsrPage } from "@/pages/CsrPage";
import { EducationPage } from "@/pages/EducationPage";
import { EndorsePage } from "@/pages/EndorsePage";
import { EndorsePassPage } from "@/pages/EndorsePassPage";
import { HomePage } from "@/pages/HomePage";
import { IntegrityPage } from "@/pages/IntegrityPage";
import { LeadershipPage } from "@/pages/LeadershipPage";
import { MembershipPage } from "@/pages/MembershipPage";
import { MobilityPage } from "@/pages/MobilityPage";
import { TugendePage } from "@/pages/TugendePage";
import { UgoPage } from "@/pages/UgoPage";
import { PluTvPage } from "@/pages/PluTvPage";
import { ProgrammeDetailPage } from "@/pages/ProgrammeDetailPage";
import { ProgrammesPage } from "@/pages/ProgrammesPage";
import { GuildPage } from "@/pages/GuildPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { ReportPage } from "@/pages/ReportPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { SocialPage } from "@/pages/SocialPage";
import { TasksPage } from "@/pages/TasksPage";
import { DigitalDutyPage } from "@/pages/DigitalDutyPage";
import { FieldDutyPage } from "@/pages/FieldDutyPage";
import { AdminDutiesPage } from "@/pages/AdminDutiesPage";
import { TourismPage } from "@/pages/TourismPage";
import { YouthPage } from "@/pages/YouthPage";
import "@/pages/AssistantPage.css";
import "@/pages/BuyUgandaPage.css";
import "@/pages/GuildPage.css";
import "@/pages/HomePage.css";
import "@/components/ProfileEditorSheet.css";
import "@/pages/ProgrammesPage.css";
import "@/pages/TasksPage.css";
import "@/pages/AccountabilityPage.css";
import "@/pages/ReportPage.css";
import "@/pages/EndorsePage.css";
import "@/components/accountability/DutyVerificationDesk.css";
import "@/pages/FieldDutyPage.css";
import "@/pages/DigitalDutyPage.css";
import "@/pages/MembershipPage.css";
import "@/pages/AdminDutiesPage.css";
import "@/styles/global.css";
import "@/styles/institutional.css";
import "@/styles/sections.css";
import "@/components/ServiceTile.css";

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
      <DutyConfigProvider>
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
      </DutyConfigProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
