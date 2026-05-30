import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MapPinned, Sparkles, ShieldAlert,
  Store, Users, BarChart3, Settings, Wifi, WifiOff, Bell, FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, MapPinned, Sparkles, ShieldAlert,
  Store, Users, BarChart3, Settings, Bell, FileText,
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { user } = useAuth();

  const role = user?.role || 'field_agent';

  const items = role === 'manager'
    ? [
        { id: 'dashboard',                   label: 'Manager Dashboard',          icon: 'LayoutDashboard', path: '/dashboard' },
        { id: 'team-performance',            label: 'Team Performance',           icon: 'Users',           path: '/team-performance' },
        { id: 'analytics',                   label: 'Territory Analytics',        icon: 'BarChart3',       path: '/analytics' },
        { id: 'rep-visit-tracking',          label: 'Rep-wise Visit Tracking',    icon: 'MapPinned',       path: '/rep-visit-tracking' },
        { id: 'high-priority-areas',          label: 'High Priority Areas',        icon: 'ShieldAlert',     path: '/high-priority-areas' },
        { id: 'product-demand-trends',        label: 'Product Demand Trends',      icon: 'BarChart3',       path: '/product-demand-trends' },
        { id: 'recommendation-acceptance',    label: 'Recommendation Acceptance',  icon: 'Sparkles',        path: '/recommendation-acceptance' },
        { id: 'risk-analyzer',               label: 'Risk Analyzer',              icon: 'ShieldAlert',     path: '/risk-analyzer' },
        { id: 'reports',                     label: 'Reports',                    icon: 'FileText',        path: '/reports' },
        { id: 'notifications',               label: 'Notifications',              icon: 'Bell',            path: '/notifications' },
        { id: 'settings',                    label: 'Settings',                   icon: 'Settings',        path: '/settings' },
      ]
    : [
        { id: 'dashboard',         label: 'Dashboard',          icon: 'LayoutDashboard', path: '/dashboard' },
        { id: 'visit-planner',     label: 'Visit Planner',       icon: 'MapPinned',       path: '/visit-planner' },
        { id: 'recommendations',   label: 'AI Recommendations',  icon: 'Sparkles',        path: '/recommendations' },
        { id: 'retailer-insights', label: 'Retailer Insights',   icon: 'Store',           path: '/retailer-insights' },
        { id: 'grower-insights',   label: 'Grower Insights',     icon: 'Users',           path: '/grower-insights' },
        { id: 'visit-feedback',    label: 'Visit Update / Feedback', icon: 'MapPinned',    path: '/visit-feedback' },
        { id: 'notifications',     label: 'Notifications',       icon: 'Bell',            path: '/notifications' },
        { id: 'settings',          label: 'Settings',            icon: 'Settings',        path: '/settings' },
      ];

  return (
    <aside className={cn('bg-deep-forest flex flex-col h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide', className)}>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 h-11 px-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-lime-green/15 text-white border-l-[3px] border-lime-green'
                  : 'text-white/60 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent'
              )}
            >
              {Icon && (
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-lime-green' : 'text-white/60 group-hover:text-white')} />
              )}
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-lime-green" />}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <><Wifi className="w-4 h-4 text-lime-green" /><span className="text-xs text-white/60">Online - Synced</span></>
          ) : (
            <><WifiOff className="w-4 h-4 text-danger-red" /><span className="text-xs text-danger-red/80">Offline - Queued</span></>
          )}
        </div>
      </div>
    </aside>
  );
}
