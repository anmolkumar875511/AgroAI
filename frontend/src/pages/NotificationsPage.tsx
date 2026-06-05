import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { notificationsAPI, type NotificationItem } from '@/api/client';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  alert:   { icon: AlertTriangle, color: 'text-danger-red',    bg: 'bg-danger-red/10' },
  warning: { icon: AlertCircle,   color: 'text-accent-yellow', bg: 'bg-accent-yellow/10' },
  success: { icon: CheckCircle,   color: 'text-lime-green',    bg: 'bg-lime-green/10' },
  info:    { icon: Info,          color: 'text-info-blue',     bg: 'bg-info-blue/10' },
};

function NotifRow({ notif, onRead }: { notif: NotificationItem; onRead: () => void }) {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <div
      onClick={onRead}
      className={cn(
        'flex items-start gap-4 p-4 border-b border-light-gray/40 dark:border-white/5 hover:bg-light-gray/40 dark:hover:bg-white/10 transition-all duration-300 hover:translate-x-1 cursor-pointer',
        !notif.read && 'bg-lime-green/[0.04] dark:bg-[#121b14]/20',
      )}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse-slow', cfg.bg)}>
        <Icon className={cn('w-5 h-5', cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-bold', !notif.read ? 'text-text-primary dark:text-white' : 'text-text-secondary dark:text-white/70')}>
            {notif.title}
          </p>
          {!notif.read && <span className="w-2 h-2 rounded-full bg-lime-green flex-shrink-0 mt-1.5 animate-pulse" />}
        </div>
        <p className="text-xs text-text-secondary dark:text-white/70 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted/50 dark:text-white/40 mt-1.5">{notif.time}</p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data, loading, refetch } = useApi(
    () => notificationsAPI.getAll(false, 50),
    [],
  );

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread_count || 0;

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await notificationsAPI.markRead(notif.id);
      refetch();
    }

    const title = notif.title;
    const message = notif.message;
    const combined = `${title} ${message}`.toLowerCase();

    let path = '/visit-planner';
    
    if (combined.includes('follow-up') || combined.includes('feedback') || combined.includes('reminder')) {
      const match = combined.match(/(rtl[-_]?\d+|r\d+)/i);
      const retailerId = match ? match[0].toUpperCase() : '';
      path = `/visit-feedback${retailerId ? `?retailer_id=${retailerId}` : ''}`;
    } else if (combined.includes('stock') || combined.includes('inventory') || combined.includes('shortage')) {
      const match = combined.match(/(rtl[-_]?\d+|r\d+)/i);
      const retailerId = match ? match[0].toUpperCase() : '';
      path = `/retailer-insights${retailerId ? `?search=${retailerId}` : ''}`;
    } else if (combined.includes('pest') || combined.includes('disease') || combined.includes('outbreak') || 
               combined.includes('stress') || combined.includes('ndvi') || combined.includes('risk') || 
               combined.includes('anomaly') || combined.includes('weather')) {
      path = '/risk-analyzer';
    } else if (combined.includes('report') || combined.includes('analytics') || combined.includes('performance') || 
               combined.includes('kpi') || combined.includes('sales') || combined.includes('target')) {
      path = '/analytics';
    } else if (combined.includes('gap') || combined.includes('route') || combined.includes('schedule') || 
               combined.includes('planner') || combined.includes('visit')) {
      path = '/visit-planner';
    } else if (combined.includes('recommendation') || combined.includes('advisory') || combined.includes('forecast') || 
               combined.includes('demand') || combined.includes('ml')) {
      path = '/recommendations';
    }

    navigate(path);
  };

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead();
    refetch();
  };

  const grouped = {
    unread: notifications.filter(n => !n.read),
    read:   notifications.filter(n => n.read),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">Notifications</h2>
          <p className="mt-1 text-sm text-text-secondary dark:text-white/60">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-button bg-light-gray dark:bg-white/5 text-sm font-medium text-text-primary dark:text-white hover:bg-light-gray/80 dark:hover:bg-white/10 transition-colors">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="backdrop-blur-md bg-white/80 dark:bg-[#121b14]/40 rounded-2xl border border-white/30 dark:border-white/5 overflow-hidden shadow-md">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 border-b border-light-gray/40 dark:border-white/5 animate-pulse bg-light-gray/30 dark:bg-white/5" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="All caught up!"
          description="You have no unread or read alerts in your history."
        />
      ) : (
        <>
          {/* Unread */}
          {grouped.unread.length > 0 && (
            <div className="backdrop-blur-md bg-white/80 dark:bg-[#121b14]/40 rounded-2xl border border-white/30 dark:border-white/5 overflow-hidden shadow-md transition-all duration-300">
              <div className="px-5 py-4 border-b border-light-gray/40 dark:border-white/5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-green animate-pulse" />
                <h3 className="text-sm font-bold text-text-primary dark:text-white uppercase tracking-wider">New ({grouped.unread.length})</h3>
              </div>
              {grouped.unread.map(n => (
                <NotifRow key={n.id} notif={n} onRead={() => handleNotificationClick(n)} />
              ))}
            </div>
          )}

          {/* Read */}
          {grouped.read.length > 0 && (
            <div className="backdrop-blur-md bg-white/80 dark:bg-[#121b14]/40 rounded-2xl border border-white/30 dark:border-white/5 overflow-hidden shadow-md transition-all duration-300">
              <div className="px-5 py-4 border-b border-light-gray/40 dark:border-white/5">
                <h3 className="text-sm font-bold text-text-muted dark:text-white/40 uppercase tracking-wider">Earlier</h3>
              </div>
              {grouped.read.map(n => (
                <NotifRow key={n.id} notif={n} onRead={() => handleNotificationClick(n)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
