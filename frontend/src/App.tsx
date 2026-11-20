import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { AppShell } from "./components/layout/AppShell";
import { LandingPage } from "./pages/LandingPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { NewReconciliationPage } from "./pages/NewReconciliationPage";
import { ResultsPage } from "./pages/ResultsPage";
import { DataExplorerPage } from "./pages/DataExplorerPage";
import { ReportsPage } from "./pages/ReportsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ThankYouPage } from "./pages/ThankYouPage";
import { captureUtm } from "./utils/utmTracker";

export const App: React.FC = () => {
  useEffect(() => { captureUtm(); }, []);
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-white text-black px-3 py-2 rounded">Skip to main content</a>
        <Routes>
          {/* Public Marketing & Legal Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Auth UI Placeholder Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Anonymous Local-First Workspace App Routes */}
          <Route path="/app" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="reconcile/new" element={<NewReconciliationPage />} />
            <Route path="reconcile/:sessionId" element={<ResultsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="data-explorer" element={<DataExplorerPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </WorkspaceProvider>
  );
};

export default App;