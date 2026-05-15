import { useState } from 'react';
import { 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  RefreshCw, 
  Shield, 
  ChevronRight,
  LogOut,
  Smartphone,
  Save
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState({
    pestAlerts: true,
    stockAlerts: true,
    visitReminders: false,
    weeklyReports: true,
  });
  const [syncEnabled, setSyncEnabled] = useState(true);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">
          Settings
        </h2>
        <p className="mt-1 text-text-muted">Manage your account preferences and application configuration.</p>
      </div>

      {/* Account Profile */}
      <section className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-light-gray dark:border-white/10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-deep-green/10 flex items-center justify-center text-deep-green dark:text-lime-green">
            <User size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-white">Amit Sharma</h3>
            <p className="text-sm text-text-muted">amit.sharma@agroai.com • Field Agent</p>
          </div>
          <button className="ml-auto px-4 py-2 text-sm font-medium text-deep-green dark:text-lime-green hover:bg-deep-green/5 dark:hover:bg-lime-green/10 rounded-lg transition-colors">
            Edit Profile
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Territory</label>
            <p className="text-sm text-text-primary dark:text-white font-medium">Bihar North - Cluster A</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Employee ID</label>
            <p className="text-sm text-text-primary dark:text-white font-medium">#AG-8829</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Appearance & Language */}
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
              <button 
                onClick={toggleTheme}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  theme === 'dark' ? "bg-lime-green" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  theme === 'dark' ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            {/* Language Selection */}
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
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-light-gray dark:bg-white/5 border-none text-sm font-medium rounded-lg px-3 py-1 text-text-primary dark:text-white outline-none focus:ring-1 focus:ring-lime-green"
              >
                <option>English</option>
                <option>Hindi (हिंदी)</option>
                <option>Bengali (বাংলা)</option>
                <option>Punjabi (ਪੰਜਾਬੀ)</option>
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
              <button 
                onClick={() => setSyncEnabled(!syncEnabled)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  syncEnabled ? "bg-lime-green" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  syncEnabled ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            <div className="pt-2">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-light-gray dark:border-white/10 text-sm font-medium text-text-primary dark:text-white hover:bg-light-gray dark:hover:bg-white/5 transition-colors">
                <RefreshCw size={16} />
                Sync Now
              </button>
              <p className="mt-2 text-[10px] text-center text-text-muted uppercase tracking-tighter">Last synced: 5 minutes ago</p>
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
              { id: 'pestAlerts', label: 'Pest Risk Alerts', desc: 'Critical alerts for village outbreaks' },
              { id: 'stockAlerts', label: 'Inventory & Stock', desc: 'Low stock alerts for retailers' },
              { id: 'visitReminders', label: 'Visit Reminders', desc: 'Daily priority visit notifications' },
              { id: 'weeklyReports', label: 'Weekly Summary', desc: 'Performance and territory reports' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary dark:text-white">{item.label}</p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
                <button 
                  onClick={() => toggleNotification(item.id as keyof typeof notifications)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    notifications[item.id as keyof typeof notifications] ? "bg-lime-green" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                    notifications[item.id as keyof typeof notifications] ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-light-gray dark:border-white/10">
            <button className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary dark:hover:text-white transition-colors">
              <Smartphone size={16} />
              Push Notification Settings
              <ChevronRight size={14} />
            </button>
          </div>
        </section>
      </div>

      {/* Danger Zone */}
      <section className="pt-6 border-t border-light-gray dark:border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-deep-green text-white text-sm font-semibold hover:bg-deep-green/90 transition-all shadow-lg shadow-deep-green/20">
          <Save size={18} />
          Save Changes
        </button>
        
        <button className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium text-sm transition-colors">
          <LogOut size={18} />
          Log Out from Account
        </button>
      </section>
    </div>
  );
}
