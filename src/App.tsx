/**
 * CHANGED FILE: src/App.tsx
 *
 * What changed:
 * 1. Wrapped everything in <AuthProvider> (new)
 * 2. Added /login route pointing to LoginPage (new)
 * 3. All dashboard routes wrapped in <ProtectedRoute> that redirects to /login
 * 4. Added /retailer-insights, /grower-insights, /visit-feedback, /notifications routes (new)
 * 5. ScrollToTop must be inside BrowserRouter — moved inside AppContent (already was)
 */
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RegionProvider } from '@/contexts/RegionContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DemoModeProvider } from '@/contexts/DemoModeContext';

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';            // NEW
import DashboardPage from '@/pages/DashboardPage';
import VisitPlannerPage from '@/pages/VisitPlannerPage';
import RecommendationsPage from '@/pages/RecommendationsPage';
import RiskAnalyzerPage from '@/pages/RiskAnalyzerPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import RetailerInsightsPage from '@/pages/RetailerInsightsPage';    // NEW
import GrowerInsightsPage from '@/pages/GrowerInsightsPage';        // NEW
import VisitFeedbackPage from '@/pages/VisitFeedbackPage';          // NEW
import NotificationsPage from '@/pages/NotificationsPage';          // NEW

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
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="w-8 h-8 border-2 border-[#1976D2] border-t-transparent rounded-full animate-spin" />
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
                  <Route path="/retailer-insights"   element={<RetailerInsightsPage />} />   {/* NEW */}
                  <Route path="/grower-insights"     element={<GrowerInsightsPage />} />      {/* NEW */}
                  <Route path="/visit-feedback"      element={<VisitFeedbackPage />} />       {/* NEW */}
                  <Route path="/notifications"       element={<NotificationsPage />} />       {/* NEW */}
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
        <DemoModeProvider>
          <RegionProvider>
            <AppContent />
          </RegionProvider>
        </DemoModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
