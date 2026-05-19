import { useLocation, useNavigate } from 'react-router-dom';
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
  Bell,   // NEW — for Notifications item
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  return (
    <aside className={cn('bg-deep-forest flex flex-col h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide', className)}>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {sidebarItems.map((item) => {
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
