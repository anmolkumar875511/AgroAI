/**
 * CHANGED FILE: src/components/layout/TopNavbar.tsx
 *
 * What changed:
 * 1. Removed: import { notifications } from '@/data/mockData'
 * 2. Added: live fetch from notificationsAPI (unread count + dropdown items)
 * 3. Added: Mark all read button calling notificationsAPI.markAllRead()
 * 4. Added: individual mark-read on click via notificationsAPI.markRead()
 * 5. Added: Logout button in user avatar dropdown using useAuth().logout()
 * 6. User name in avatar now comes from useAuth().user.name (was hardcoded "AS")
 * 7. Region selector still uses RegionContext (no change needed there)
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, MapPin, ChevronDown, Sun, Moon, Leaf, LogOut, User, Play, RotateCcw } from 'lucide-react';
import { useRegion } from '@/contexts/RegionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';               // NEW
import { useApi } from '@/hooks/useApi';                       // NEW
import { notificationsAPI } from '@/api/client';               // NEW
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { formatDistanceToNow } from 'date-fns';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { cn } from '@/lib/utils';

interface TopNavbarProps {
  onMenuClick: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();                          // NEW
  const [notifOpen, setNotifOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);     // NEW
  const regionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { activeRegion, setActiveRegionId, regions } = useRegion();
  const { pestOutbreakSim, simulatePestOutbreak, clearPestDemo } = useDemoMode();
  const isOnline = useOnlineStatus();
  const [lastSync, setLastSync] = useState(() => new Date());

  useEffect(() => {
    if (!isOnline) return;
    const id = window.setInterval(() => setLastSync(new Date()), 120_000);
    return () => window.clearInterval(id);
  }, [isOnline]);

  // ── CHANGED: live notifications instead of mock ─────────────────
  const { data: notifData, refetch: refetchNotifs } = useApi(
    () => notificationsAPI.getAll(false, 20),
    [],
  );
  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unread_count || 0;

  const handleMarkRead = async (id: string) => {
    await notificationsAPI.markRead(id);
    refetchNotifs();
  };

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead();
    refetchNotifs();
  };
  // ────────────────────────────────────────────────────────────────

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setRegionOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // User initials for avatar (was hardcoded "AS")
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AG';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0F172A] border-b border-white/10 z-50">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
            <Menu className="w-5 h-5 text-slate-200" />
          </button>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 cursor-pointer">
            <Leaf className="w-5 h-5 text-[#388E3C]" />
            <span className="text-lg font-bold text-white tracking-tight">AgroAI</span>
            <span className="hidden xl:inline text-[10px] font-mono uppercase tracking-widest text-slate-500 border border-white/10 rounded px-1.5 py-0.5">
              Field ops
            </span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 flex-shrink-0 ml-auto mr-4">
          <div
            className={cn(
              'flex items-center gap-2 h-9 px-3 rounded-lg border text-xs font-medium max-w-[200px]',
              isOnline
                ? 'border-[#388E3C]/40 bg-[#388E3C]/10 text-[#C8E6C9]'
                : 'border-[#D32F2F]/50 bg-[#D32F2F]/15 text-[#FFCDD2]',
            )}
          >
            <span className={cn('w-2 h-2 rounded-full flex-shrink-0', isOnline ? 'bg-[#388E3C]' : 'bg-[#D32F2F] animate-pulse')} />
            <span className="truncate">
              {isOnline ? `Synced ${formatDistanceToNow(lastSync, { addSuffix: true })}` : 'Offline mode active'}
            </span>
          </div>
          {pestOutbreakSim ? (
            <button
              type="button"
              onClick={clearPestDemo}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/15 bg-[#1E293B] text-xs font-semibold text-slate-200 hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset demo
            </button>
          ) : (
            <button
              type="button"
              onClick={simulatePestOutbreak}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#D32F2F]/40 bg-[#D32F2F]/15 text-xs font-semibold text-[#FFCDD2] hover:bg-[#D32F2F]/25 transition-colors shadow-[0_0_14px_rgba(211,47,47,0.18)]"
            >
              <Play className="w-3.5 h-3.5 shrink-0 fill-current" /> Simulate pest outbreak
            </button>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Territory Selector */}
          <div className="relative hidden sm:block" ref={regionRef}>
            <button onClick={() => setRegionOpen(!regionOpen)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg bg-[#1E293B] border border-white/10 hover:bg-white/5 transition-colors">
              <MapPin className="w-4 h-4 text-[#1976D2]" />
              <span className="text-sm font-semibold text-white">{activeRegion.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
            {regionOpen && (
              <div className="absolute top-11 right-0 w-48 bg-[#1E293B] border border-white/10 rounded-lg shadow-dropdown overflow-hidden z-50">
                {regions.map(region => (
                  <button key={region.id} onClick={() => { setActiveRegionId(region.id); setRegionOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      activeRegion.id === region.id
                        ? 'bg-[#1976D2]/15 text-[#90CAF9] font-semibold'
                        : 'text-slate-200 hover:bg-white/5'
                    }`}>
                    {region.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F9A825]" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Notifications — CHANGED: live data */}
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5 text-slate-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] flex items-center justify-center bg-[#D32F2F] text-white text-[10px] font-mono font-bold rounded-full animate-pulse-dot">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-12 w-80 bg-[#1E293B] rounded-xl shadow-dropdown border border-white/10 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-[#388E3C] hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkRead(notif.id)}
                        className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!notif.read ? 'bg-[#1976D2]/8' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notif.type === 'alert' ? 'bg-[#D32F2F]' :
                            notif.type === 'warning' ? 'bg-[#F9A825]' :
                            notif.type === 'success' ? 'bg-[#388E3C]' : 'bg-[#1976D2]'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{notif.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[11px] text-slate-600 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-8">No notifications</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Avatar — CHANGED: shows real name, has logout */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-9 h-9 rounded-full bg-[#2E7D32] border border-[#388E3C]/50 flex items-center justify-center shadow-[0_0_12px_rgba(46,125,50,0.25)]"
            >
              <span className="text-[13px] font-semibold text-white">{initials}</span>
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-11 w-48 bg-[#1E293B] border border-white/10 rounded-lg shadow-dropdown z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-500" /> Settings
                  </button>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#FFCDD2] hover:bg-[#D32F2F]/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
