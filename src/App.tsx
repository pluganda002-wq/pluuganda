import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { UserProvider } from "@/context/UserContext";
import { AssistantPage } from "@/pages/AssistantPage";
import { BuyUgandaPage } from "@/pages/BuyUgandaPage";
import { CharityPage } from "@/pages/CharityPage";
import { CsrPage } from "@/pages/CsrPage";
import { EducationPage } from "@/pages/EducationPage";
import { EndorsePage } from "@/pages/EndorsePage";
import { HomePage } from "@/pages/HomePage";
import { IntegrityPage } from "@/pages/IntegrityPage";
import { LeadershipPage } from "@/pages/LeadershipPage";
import { MembershipPage } from "@/pages/MembershipPage";
import { MobilityPage } from "@/pages/MobilityPage";
import { PluTvPage } from "@/pages/PluTvPage";
import { ProgrammeDetailPage } from "@/pages/ProgrammeDetailPage";
import { ProgrammesPage } from "@/pages/ProgrammesPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { ReportPage } from "@/pages/ReportPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { SocialPage } from "@/pages/SocialPage";
import { TasksPage } from "@/pages/TasksPage";
import { TourismPage } from "@/pages/TourismPage";
import { YouthPage } from "@/pages/YouthPage";
import "@/pages/AssistantPage.css";
import "@/pages/BuyUgandaPage.css";
import "@/pages/HomePage.css";
import "@/pages/ProgrammesPage.css";
import "@/styles/global.css";
import "@/styles/institutional.css";
import "@/styles/sections.css";
import "@/components/ServiceTile.css";

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/programmes" element={<ProgrammesPage />} />
            <Route path="/programmes/:slug" element={<ProgrammeDetailPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/social" element={<SocialPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/endorse" element={<EndorsePage />} />
            <Route path="/integrity" element={<IntegrityPage />} />
            <Route path="/integrity/report" element={<ReportPage />} />
            <Route path="/youth" element={<YouthPage />} />
            <Route path="/charity" element={<CharityPage />} />
            <Route path="/csr" element={<CsrPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/leadership" element={<LeadershipPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/mobility" element={<MobilityPage />} />
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
    </UserProvider>
  );
}
