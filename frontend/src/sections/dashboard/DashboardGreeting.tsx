import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { WeatherWidget } from '@/components/shared/WeatherWidget';

const localeMap: Record<string, string> = {
  'English': 'en-US',
  'Hindi (हिंदी)': 'hi-IN',
  'Bengali (বাংলা)': 'bn-IN',
  'Punjabi (ਪੰਜਾਬੀ)': 'pa-IN',
};

export function DashboardGreeting() {
  const { user } = useAuth();
  const { t, language } = useTranslation();

  const now = new Date();
  const hours = now.getHours();
  const greetingKey = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';
  const greeting = t(greetingKey);
  const firstName = user?.name?.split(' ')[0] || 'Agent';
  const locale = localeMap[language || 'English'] || 'en-US';
  const dateStr = now.toLocaleDateString(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-deep-green/5 via-lime-green/5 to-transparent dark:from-lime-green/10 dark:via-deep-green/5 dark:to-transparent p-5 sm:p-6.5 border border-deep-green/10 dark:border-lime-green/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 shadow-sm">
      <div className="space-y-1 z-10">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-text-primary dark:text-white drop-shadow-sm">
          {greeting}, <span className="bg-gradient-to-r from-deep-green to-lime-green dark:from-lime-green dark:to-emerald-400 bg-clip-text text-transparent">{firstName}</span>
        </h1>
        <p className="text-xs font-medium text-text-muted dark:text-white/60 tracking-wide">
          Business dashboard · {dateStr}
        </p>
      </div>
      <div className="z-10 flex-shrink-0">
        <WeatherWidget />
      </div>
      {/* Decorative premium glow vector in background */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-lime-green/10 rounded-full blur-3xl -z-10 pointer-events-none" />
    </div>
  );
}
