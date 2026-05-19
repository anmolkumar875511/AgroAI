// src/pages/NotificationsPage.tsx
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { notificationsAPI, type NotificationItem } from '@/api/client';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<string, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  alert:   { icon: AlertTriangle, color: 'text-[#D32F2F]',    bg: 'bg-[#D32F2F]/15' },
  warning: { icon: AlertCircle,   color: 'text-[#F9A825]', bg: 'bg-[#F9A825]/12' },
  success: { icon: CheckCircle,   color: 'text-[#388E3C]',    bg: 'bg-[#388E3C]/12' },
  info:    { icon: Info,          color: 'text-[#1976D2]',     bg: 'bg-[#1976D2]/12' },
};

function NotifRow({ notif, onRead }: { notif: NotificationItem; onRead: () => void }) {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;
  const isAlert = notif.type === 'alert';

  return (
    <div
      onClick={onRead}
      className={cn(
        'flex items-start gap-4 p-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer',
        !notif.read && 'bg-[#1976D2]/[0.04]',
        isAlert && 'ops-alert-pulse border-l-[3px] border-l-[#D32F2F]',
      )}
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg)}>
        <Icon className={cn('w-5 h-5', cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-semibold', !notif.read ? 'text-white' : 'text-slate-400')}>
            {notif.title}
          </p>
          {!notif.read && <span className="w-2 h-2 rounded-full bg-[#1976D2] flex-shrink-0 mt-1.5 shadow-[0_0_8px_rgba(25,118,210,0.5)]" />}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
        <p className="text-[11px] text-slate-600 mt-1">{notif.time}</p>
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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#D32F2F]">Smart alert center</p>
          <h2 className="text-2xl lg:text-3xl font-bold text-white mt-1">Field alerts</h2>
          <p className="mt-1 text-sm text-slate-400">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E293B] border border-white/10 text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors">
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 border-b border-white/5 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">No notifications yet.</p>
        </div>
      ) : (
        <>
          {/* Unread */}
          {grouped.unread.length > 0 && (
            <div className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden shadow-[0_0_24px_rgba(0,0,0,0.2)]">
              <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D32F2F] animate-pulse" />
                <h3 className="text-sm font-semibold text-white">New ({grouped.unread.length})</h3>
              </div>
              {grouped.unread.map(n => (
                <NotifRow key={n.id} notif={n} onRead={() => handleRead(n.id)} />
              ))}
            </div>
          )}

          {/* Read */}
          {grouped.read.length > 0 && (
            <div className="bg-[#1E293B] rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-sm font-semibold text-slate-500">Earlier</h3>
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
