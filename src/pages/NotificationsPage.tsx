import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { notificationsAPI, type NotificationItem } from '@/api/client';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
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
        'flex items-start gap-4 p-4 border-b border-light-gray dark:border-white/5 hover:bg-light-gray/30 dark:hover:bg-white/5 transition-colors cursor-pointer',
        !notif.read && 'bg-lime-green/[0.03]',
      )}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg)}>
        <Icon className={cn('w-5 h-5', cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-semibold', !notif.read ? 'text-text-primary dark:text-white' : 'text-text-secondary dark:text-white/70')}>
            {notif.title}
          </p>
          {!notif.read && <span className="w-2 h-2 rounded-full bg-lime-green flex-shrink-0 mt-1.5" />}
        </div>
        <p className="text-xs text-text-muted mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
        <p className="text-[11px] text-text-muted/60 mt-1">{notif.time}</p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { data, loading, refetch } = useApi(
    () => notificationsAPI.getAll(false, 50),
    [],
  );

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread_count || 0;

  const handleRead = async (id: string) => {
    await notificationsAPI.markRead(id);
    refetch();
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
        <div className="bg-white dark:bg-white/5 rounded-card border border-transparent dark:border-white/5 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 border-b border-light-gray dark:border-white/5 animate-pulse bg-light-gray/30 dark:bg-white/5" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <p className="text-text-muted text-sm">No notifications yet.</p>
        </div>
      ) : (
        <>
          {/* Unread */}
          {grouped.unread.length > 0 && (
            <div className="bg-white dark:bg-white/5 rounded-card border border-transparent dark:border-white/5 overflow-hidden shadow-card">
              <div className="px-4 py-3 border-b border-light-gray dark:border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-green animate-pulse" />
                <h3 className="text-sm font-semibold text-text-primary dark:text-white">New ({grouped.unread.length})</h3>
              </div>
              {grouped.unread.map(n => (
                <NotifRow key={n.id} notif={n} onRead={() => handleRead(n.id)} />
              ))}
            </div>
          )}

          {/* Read */}
          {grouped.read.length > 0 && (
            <div className="bg-white dark:bg-white/5 rounded-card border border-transparent dark:border-white/5 overflow-hidden shadow-card">
              <div className="px-4 py-3 border-b border-light-gray dark:border-white/10">
                <h3 className="text-sm font-semibold text-text-muted">Earlier</h3>
              </div>
              {grouped.read.map(n => (
                <NotifRow key={n.id} notif={n} onRead={() => {}} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
