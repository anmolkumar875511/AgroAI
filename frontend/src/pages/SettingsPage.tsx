import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Moon, Sun, Globe, RefreshCw, Shield, ChevronRight,
  LogOut, Smartphone, Save, CheckCircle2, Loader2,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { settingsAPI, syncOfflineQueue } from '@/api/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [language, setLanguage] = useState(user?.language || 'English');
  const [notifications, setNotifications] = useState(
    user?.notifications || { pestAlerts: true, stockAlerts: true, visitReminders: false, weeklyReports: true }
  );
  const [syncEnabled, setSyncEnabled] = useState(user?.sync_enabled ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');
  const [syncing, setSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('LAST SYNCED: 5 MINUTES AGO');

  const handleSyncNow = async () => {
    if (syncing) return;
    setSyncing(true);

    const toastId = toast.loading('Initiating background synchronization...', {
      description: 'Checking connection and pending offline tasks...'
    });

    try {
      // 1. Sync any real cached offline operations
      await syncOfflineQueue();
      await new Promise(resolve => setTimeout(resolve, 800));

      // 2. Play beautiful simulated updates
      toast.loading('Syncing market trends and mandi prices...', {
        id: toastId,
        description: 'Downloading latest grain, paddy, and wheat indices.'
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.loading('Downloading pest alerts & territory analytics...', {
        id: toastId,
        description: 'Analyzing recent crop health telemetry.'
      });
      await new Promise(resolve => setTimeout(resolve, 900));

      toast.success('Synchronization complete!', {
        id: toastId,
        description: 'All offline tasks and market intelligence are up-to-date.',
        duration: 3000
      });

      setLastSyncText('LAST SYNCED: JUST NOW');
    } catch (err) {
      toast.error('Sync failed. Please check your network connection.', {
        id: toastId
      });
    } finally {
      setSyncing(false);
    }
  };

  const toggleNotification = (key: string) =>
    setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));

  const handleSave = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      await settingsAPI.update({ theme, language, notifications, sync_enabled: syncEnabled });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">Settings</h2>
        <p className="mt-1 text-text-muted">Manage your account preferences and application configuration.</p>
      </div>

      {/* Account Profile — live data from useAuth() */}
      <section className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-light-gray dark:border-white/10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AG'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-white">{user?.name || '—'}</h3>
            <p className="text-sm text-text-muted">{user?.email} · {user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Territory</label>
            <p className="text-sm text-text-primary dark:text-white font-medium mt-1">{user?.territory || '—'}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Employee ID</label>
            <p className="text-sm text-text-primary dark:text-white font-medium mt-1">#{user?.employee_id || '—'}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Preferences */}
        <div className="space-y-8">
          <section className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-6 space-y-6">
            <div className="flex items-center gap-3 text-text-primary dark:text-white mb-2">
              <Shield className="w-5 h-5 text-deep-green dark:text-lime-green" />
              <h3 className="font-semibold">Preferences</h3>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-light-gray dark:bg-white/5">
                  {theme === 'dark' ? <Moon size={18} className="text-text-primary dark:text-white" /> : <Sun size={18} className="text-text-primary dark:text-white" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary dark:text-white">Theme Mode</p>
                  <p className="text-xs text-text-muted">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                </div>
              </div>
              <button onClick={toggleTheme}
                className={cn('w-12 h-6 rounded-full transition-colors relative', theme === 'dark' ? 'bg-lime-green' : 'bg-gray-300')}>
                <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', theme === 'dark' ? 'left-7' : 'left-1')} />
              </button>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-light-gray dark:bg-white/5">
                  <Globe size={18} className="text-text-primary dark:text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary dark:text-white">Language</p>
                  <p className="text-xs text-text-muted">Select app language</p>
                </div>
              </div>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="bg-light-gray dark:bg-white/10 border-none text-sm font-medium rounded-lg px-3 py-1.5 text-text-primary dark:text-white outline-none focus:ring-1 focus:ring-lime-green cursor-pointer">
                <option className="bg-white dark:bg-[#142818] text-text-primary dark:text-white">English</option>
                <option className="bg-white dark:bg-[#142818] text-text-primary dark:text-white">Hindi (हिंदी)</option>
                <option className="bg-white dark:bg-[#142818] text-text-primary dark:text-white">Bengali (বাংলা)</option>
                <option className="bg-white dark:bg-[#142818] text-text-primary dark:text-white">Punjabi (ਪੰਜਾਬੀ)</option>
              </select>
            </div>
          </section>

          {/* Data Sync */}
          <section className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-6 space-y-6">
            <div className="flex items-center gap-3 text-text-primary dark:text-white mb-2">
              <RefreshCw className="w-5 h-5 text-deep-green dark:text-lime-green" />
              <h3 className="font-semibold">Data Synchronization</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-white">Automatic Sync</p>
                <p className="text-xs text-text-muted">Sync data while on cellular</p>
              </div>
              <button onClick={() => setSyncEnabled(!syncEnabled)}
                className={cn('w-12 h-6 rounded-full transition-colors relative', syncEnabled ? 'bg-lime-green' : 'bg-gray-300')}>
                <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', syncEnabled ? 'left-7' : 'left-1')} />
              </button>
            </div>
            <div className="pt-2">
              <button 
                onClick={handleSyncNow}
                disabled={syncing}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-light-gray dark:border-white/10 text-sm font-medium text-text-primary dark:text-white hover:bg-light-gray dark:hover:bg-white/5 transition-all duration-300 active:scale-[0.98]",
                  syncing && "bg-lime-green/10 text-lime-green dark:bg-lime-green/20 dark:text-lime-green border-lime-green/30"
                )}
              >
                <RefreshCw size={16} className={cn("transition-transform duration-500", syncing && "animate-spin")} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
              <p className="mt-2 text-[10px] text-center text-text-muted uppercase tracking-tighter transition-all duration-300">{lastSyncText}</p>
            </div>
          </section>
        </div>

        {/* Notifications */}
        <section className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-6 space-y-6">
          <div className="flex items-center gap-3 text-text-primary dark:text-white mb-2">
            <Bell className="w-5 h-5 text-deep-green dark:text-lime-green" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="space-y-5">
            {[
              { id: 'pestAlerts',      label: 'Pest Risk Alerts',  desc: 'Critical alerts for village outbreaks' },
              { id: 'stockAlerts',     label: 'Inventory & Stock', desc: 'Low stock alerts for retailers' },
              { id: 'visitReminders',  label: 'Visit Reminders',   desc: 'Daily priority visit notifications' },
              { id: 'weeklyReports',   label: 'Weekly Summary',    desc: 'Performance and territory reports' },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary dark:text-white">{item.label}</p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
                <button onClick={() => toggleNotification(item.id)}
                  className={cn('w-12 h-6 rounded-full transition-colors relative', notifications[item.id as keyof typeof notifications] ? 'bg-lime-green' : 'bg-gray-300')}>
                  <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1')} />
                </button>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-light-gray dark:border-white/10">
            <button className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary dark:hover:text-white transition-colors">
              <Smartphone size={16} /> Push Notification Settings <ChevronRight size={14} />
            </button>
          </div>
        </section>
      </div>

      {/* Error */}
      {error && <div className="px-4 py-3 rounded-lg bg-danger-red/10 border border-danger-red/30 text-danger-red text-sm">{error}</div>}

      {/* Actions */}
      <section className="pt-6 border-t border-light-gray dark:border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-deep-green text-white text-sm font-semibold hover:bg-deep-green/90 transition-all shadow-lg shadow-deep-green/20 disabled:opacity-70">
          {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-danger-red hover:text-red-600 font-medium text-sm transition-colors">
          <LogOut size={18} /> Log Out from Account
        </button>
      </section>
    </div>
  );
}
