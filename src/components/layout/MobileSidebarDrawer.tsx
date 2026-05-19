import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MapPinned, Sparkles, ShieldAlert,
  Store, Users, BarChart3, Settings, Wifi, WifiOff, Bell,
} from 'lucide-react';
import { sidebarItems } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, MapPinned, Sparkles, ShieldAlert,
  Store, Users, BarChart3, Settings,
  Bell,
};

interface MobileSidebarDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebarDrawer({ open, onClose }: MobileSidebarDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

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
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-[#0D2818] z-50 flex flex-col border-r border-[#1B5E20]/40"
          >
            <nav className="flex-1 px-3 py-4 space-y-1 mt-4">
              {sidebarItems.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => { navigate(item.path); onClose(); }}
                    className={cn(
                      'w-full flex items-center gap-3 h-12 px-4 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-[#2E7D32]/25 text-white border-l-[3px] border-[#8BC34A]'
                        : 'text-white/60 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent'
                    )}
                  >
                    {Icon && <Icon className={cn('w-5 h-5', isActive ? 'text-[#8BC34A]' : 'text-white/60')} />}
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="px-5 py-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <><Wifi className="w-4 h-4 text-[#8BC34A]" /><span className="text-xs text-white/60">Online - synced</span></>
                ) : (
                  <><WifiOff className="w-4 h-4 text-[#D32F2F]" /><span className="text-xs text-[#FFCDD2]/90">Offline - queued</span></>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

