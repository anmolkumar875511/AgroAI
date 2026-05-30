import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MapPinned, Sparkles, ShieldAlert,
  Store, Users, BarChart3, Settings, Leaf, Wifi, WifiOff, Bell, FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, MapPinned, Sparkles, ShieldAlert,
  Store, Users, BarChart3, Settings, Bell, FileText,
};

interface MobileSidebarDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebarDrawer({ open, onClose }: MobileSidebarDrawerProps) {
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
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-deep-forest z-50 flex flex-col"
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
              <Leaf className="w-5 h-5 text-lime-green" />
              <span className="text-lg font-bold text-white tracking-tight">AgroAI</span>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1">
              {items.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => { navigate(item.path); onClose(); }}
                    className={cn(
                      'w-full flex items-center gap-3 h-12 px-4 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-lime-green/15 text-white border-l-[3px] border-lime-green'
                        : 'text-white/60 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent'
                    )}
                  >
                    {Icon && <Icon className={cn('w-5 h-5', isActive ? 'text-lime-green' : 'text-white/60')} />}
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="px-5 py-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <><Wifi className="w-4 h-4 text-lime-green" /><span className="text-xs text-white/60">Online - Synced</span></>
                ) : (
                  <><WifiOff className="w-4 h-4 text-danger-red" /><span className="text-xs text-danger-red/80">Offline - Queued</span></>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
