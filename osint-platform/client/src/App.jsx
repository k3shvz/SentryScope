import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ChangelogPage from './pages/ChangelogPage';
import DocumentationPage from './pages/DocumentationPage';
import ApiReferencePage from './pages/ApiReferencePage';
import StatusPage from './pages/StatusPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AcceptableUsePage from './pages/AcceptableUsePage';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardHome from './pages/dashboard/DashboardHome';
import UsernameSearchPage from './pages/dashboard/UsernameSearchPage';
import EmailInvestigationPage from './pages/dashboard/EmailInvestigationPage';
import DomainInvestigationPage from './pages/dashboard/DomainInvestigationPage';
import TechDetectionPage from './pages/dashboard/TechDetectionPage';
import MetadataAnalyzerPage from './pages/dashboard/MetadataAnalyzerPage';
import ImageAnalyzerPage from './pages/dashboard/ImageAnalyzerPage';
import PasswordCheckerPage from './pages/dashboard/PasswordCheckerPage';
import RelationshipGraphPage from './pages/dashboard/RelationshipGraphPage';
import TimelinePage from './pages/dashboard/TimelinePage';
import SettingsPage from './pages/dashboard/SettingsPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/changelog" element={<ChangelogPage />} />
      <Route path="/documentation" element={<DocumentationPage />} />
      <Route path="/api-reference" element={<ApiReferencePage />} />
      <Route path="/status" element={<StatusPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/acceptable-use" element={<AcceptableUsePage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="username" element={<UsernameSearchPage />} />
        <Route path="email" element={<EmailInvestigationPage />} />
        <Route path="domain" element={<DomainInvestigationPage />} />
        <Route path="tech" element={<TechDetectionPage />} />
        <Route path="metadata" element={<MetadataAnalyzerPage />} />
        <Route path="image" element={<ImageAnalyzerPage />} />
        <Route path="password" element={<PasswordCheckerPage />} />
        <Route path="graph" element={<RelationshipGraphPage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
