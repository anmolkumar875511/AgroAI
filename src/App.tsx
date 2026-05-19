import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RegionProvider } from '@/contexts/RegionContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

import { Toaster } from '@/components/ui/sonner';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import VisitPlannerPage from '@/pages/VisitPlannerPage';
import RecommendationsPage from '@/pages/RecommendationsPage';
import RiskAnalyzerPage from '@/pages/RiskAnalyzerPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import RetailerInsightsPage from '@/pages/RetailerInsightsPage';
import GrowerInsightsPage from '@/pages/GrowerInsightsPage';
import VisitFeedbackPage from '@/pages/VisitFeedbackPage';
import NotificationsPage from '@/pages/NotificationsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/** Redirects unauthenticated users to /login */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-forest">
        <div className="w-8 h-8 border-2 border-lime-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppContent() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — all wrapped in ProtectedRoute + AppLayout */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/dashboard"          element={<DashboardPage />} />
                  <Route path="/visit-planner"       element={<VisitPlannerPage />} />
                  <Route path="/recommendations"     element={<RecommendationsPage />} />
                  <Route path="/risk-analyzer"       element={<RiskAnalyzerPage />} />
                  <Route path="/analytics"           element={<AnalyticsPage />} />
                  <Route path="/retailer-insights"   element={<RetailerInsightsPage />} />
                  <Route path="/grower-insights"     element={<GrowerInsightsPage />} />
                  <Route path="/visit-feedback"      element={<VisitFeedbackPage />} />
                  <Route path="/notifications"       element={<NotificationsPage />} />
                  <Route path="/settings"            element={<SettingsPage />} />
                  <Route path="*"                    element={<DashboardPage />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RegionProvider>
          <AppContent />
        </RegionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
