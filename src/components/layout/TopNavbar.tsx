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
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, MapPin, ChevronDown, Sun, Moon, Leaf, LogOut, User } from 'lucide-react';
import { useBreakpoint } from '@/hooks/useMediaQuery';
import { useRegion } from '@/contexts/RegionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';               // NEW
import { useApi } from '@/hooks/useApi';                       // NEW
import { notificationsAPI } from '@/api/client';               // NEW

interface TopNavbarProps {
  onMenuClick: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();                          // NEW
  const [notifOpen, setNotifOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);     // NEW
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const { activeRegion, setActiveRegionId, regions } = useRegion();
  const regionRef = useRef<HTMLDivElement>(null);

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
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0A1A0C] border-b border-light-gray dark:border-white/10 z-50 shadow-card">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-light-gray dark:hover:bg-white/5 transition-colors">
            <Menu className="w-5 h-5 text-text-primary dark:text-white" />
          </button>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 cursor-pointer">
            <Leaf className="w-5 h-5 text-lime-green" />
            <span className="text-lg font-bold text-deep-green dark:text-white tracking-tight">AgroAI</span>
          </button>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className={`flex items-center w-full h-10 rounded-full px-4 transition-all duration-200 ${
            searchFocused ? 'bg-white dark:bg-white/10 ring-2 ring-deep-green/20 shadow-card' : 'bg-light-gray dark:bg-white/5'
          }`}>
            <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Search retailers, villages, products, alerts..."
              className="flex-1 bg-transparent border-none outline-none text-sm ml-2 text-text-primary dark:text-white placeholder:text-text-muted"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Territory Selector */}
          <div className="relative hidden sm:block" ref={regionRef}>
            <button onClick={() => setRegionOpen(!regionOpen)}
              className="flex items-center gap-2 h-9 px-3 rounded-button bg-light-gray dark:bg-white/5 hover:bg-light-gray/80 dark:hover:bg-white/10 transition-colors">
              <MapPin className="w-4 h-4 text-deep-green dark:text-lime-green" />
              <span className="text-sm font-semibold text-text-primary dark:text-white">{activeRegion.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
            {regionOpen && (
              <div className="absolute top-11 right-0 w-48 bg-white dark:bg-[#1A1D18] border border-light-gray dark:border-white/10 rounded-lg shadow-dropdown overflow-hidden z-50">
                {regions.map(region => (
                  <button key={region.id} onClick={() => { setActiveRegionId(region.id); setRegionOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      activeRegion.id === region.id
                        ? 'bg-lime-green/10 text-deep-green dark:text-lime-green font-semibold'
                        : 'text-text-primary dark:text-white hover:bg-light-gray/50 dark:hover:bg-white/5'
                    }`}>
                    {region.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-light-gray dark:hover:bg-white/5 transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-accent-yellow" /> : <Moon className="w-4 h-4 text-text-muted" />}
          </button>

          {/* Notifications — CHANGED: live data */}
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-light-gray dark:hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5 text-text-primary dark:text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] flex items-center justify-center bg-danger-red text-white text-[10px] font-mono font-bold rounded-full animate-pulse-dot">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#1A1D18] rounded-card shadow-dropdown border border-light-gray dark:border-white/10 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-light-gray dark:border-white/10 flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-text-primary dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-lime-green hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkRead(notif.id)}
                        className={`px-4 py-3 border-b border-light-gray/50 dark:border-white/5 hover:bg-light-gray/50 dark:hover:bg-white/5 transition-colors cursor-pointer ${!notif.read ? 'bg-lime-green/5' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            notif.type === 'alert' ? 'bg-danger-red' :
                            notif.type === 'warning' ? 'bg-accent-yellow' :
                            notif.type === 'success' ? 'bg-lime-green' : 'bg-info-blue'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary dark:text-white">{notif.title}</p>
                            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[11px] text-text-muted mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-sm text-text-muted text-center py-8">No notifications</p>
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
              className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center"
            >
              <span className="text-[13px] font-semibold text-white">{initials}</span>
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-11 w-48 bg-white dark:bg-[#1A1D18] border border-light-gray dark:border-white/10 rounded-lg shadow-dropdown z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-light-gray dark:border-white/10">
                    <p className="text-sm font-semibold text-text-primary dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary dark:text-white hover:bg-light-gray/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4 text-text-muted" /> Settings
                  </button>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-red hover:bg-danger-red/5 transition-colors"
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
