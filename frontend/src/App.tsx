import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthProvider } from './context/AuthContext'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { DashboardPage } from './pages/app/DashboardPage'
import { ProjectsPage } from './pages/app/ProjectsPage'
import { NewReconciliationPage } from './pages/app/NewReconciliationPage'
import { ReconciliationResultsPage } from './pages/app/ReconciliationResultsPage'
import { DataExplorerPage } from './pages/app/DataExplorerPage'
import { ReportsPage } from './pages/app/ReportsPage'
import { HistoryPage } from './pages/app/HistoryPage'
import { SettingsPage } from './pages/app/SettingsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { FeaturesPage } from './pages/FeaturesPage'
import { HowItWorksPage } from './pages/HowItWorksPage'
import { UseCasesPage } from './pages/UseCasesPage'
import { DocsPage } from './pages/DocsPage'
import { NotFoundPage } from './pages/NotFoundPage'

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/use-cases" element={<UseCasesPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      
      {/* Auth Routes (UI only) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* App Routes */}
      <Route path="/app/*" element={<AppShell />}>
        <Route index element={<Navigate to="/app" replace />} />
        <Route path="app" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="reconcile/new" element={<NewReconciliationPage />} />
        <Route path="reconcile/:sessionId" element={<ReconciliationResultsPage />} />
        <Route path="data-explorer" element={<DataExplorerPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App