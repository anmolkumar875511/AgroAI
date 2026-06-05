/**
 * Breadcrumbs component for navigation trail
 * UX FIX: Add breadcrumbs as per audit recommendation
 */
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNameMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/visit-planner': 'Visit Planner',
  '/recommendations': 'Recommendations',
  '/risk-analyzer': 'Risk Analyzer',
  '/analytics': 'Analytics',
  '/retailer-insights': 'Retailer Insights',
  '/grower-insights': 'Grower Insights',
  '/visit-feedback': 'Visit Feedback',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/team-performance': 'Team Performance',
  '/reports': 'Reports',
  '/rep-visit-tracking': 'Rep Visit Tracking',
  '/high-priority-areas': 'High Priority Areas',
  '/product-demand-trends': 'Product Demand Trends',
  '/recommendation-acceptance': 'Recommendation Acceptance',
};

export function Breadcrumbs() {
  const location = useLocation();
  const path = location.pathname;
  
  // Don't show on landing or login pages
  if (path === '/' || path === '/login') return null;
  
  const pageName = routeNameMap[path] || 'Page';
  
  return (
    <nav 
      className="flex items-center gap-2 px-6 py-3 text-sm text-sage-green/60"
      aria-label="Breadcrumb"
    >
      <Link 
        to="/dashboard" 
        className="flex items-center gap-1 hover:text-lime-green transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-sage-green font-medium">{pageName}</span>
    </nav>
  );
}
