import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Component, useEffect } from 'react';
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
import AdminPanelPage from '@/pages/AdminPanelPage';

// New Manager Pages
import TeamPerformancePage from '@/pages/TeamPerformancePage';
import ReportsPage from '@/pages/ReportsPage';
import RepVisitTrackingPage from '@/pages/RepVisitTrackingPage';
import HighPriorityAreasPage from '@/pages/HighPriorityAreasPage';
import ProductDemandTrendsPage from '@/pages/ProductDemandTrendsPage';
import RecommendationAcceptancePage from '@/pages/RecommendationAcceptancePage';

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-off-white p-6 text-danger-red">
          <h1 className="text-lg font-semibold">App render error</h1>
          <pre className="mt-3 whitespace-pre-wrap text-sm">{this.state.error.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

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

/** Redirects non-managers/non-admins to dashboard */
function ManagerRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-forest">
        <div className="w-8 h-8 border-2 border-lime-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

/** Redirects non-admins to dashboard */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-forest">
        <div className="w-8 h-8 border-2 border-lime-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
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
              <ErrorBoundary>
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

                    {/* Admin specific routes */}
                    <Route path="/admin-panel"         element={<AdminRoute><AdminPanelPage /></AdminRoute>} />

                    {/* Manager specific routes */}
                    <Route path="/team-performance"    element={<ManagerRoute><TeamPerformancePage /></ManagerRoute>} />
                    <Route path="/reports"             element={<ManagerRoute><ReportsPage /></ManagerRoute>} />
                    <Route path="/rep-visit-tracking"  element={<ManagerRoute><RepVisitTrackingPage /></ManagerRoute>} />
                    <Route path="/high-priority-areas" element={<ManagerRoute><HighPriorityAreasPage /></ManagerRoute>} />
                    <Route path="/product-demand-trends" element={<ManagerRoute><ProductDemandTrendsPage /></ManagerRoute>} />
                    <Route path="/recommendation-acceptance" element={<ManagerRoute><RecommendationAcceptancePage /></ManagerRoute>} />

                    <Route path="*"                    element={<DashboardPage />} />
                  </Routes>
                </AppLayout>
              </ErrorBoundary>
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
