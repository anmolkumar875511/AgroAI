import { WeatherWidget } from '@/components/shared/WeatherWidget';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardGreeting() {
  const { user } = useAuth();
  const displayName = user?.name?.split(' ')[0] || 'Operator';
  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-white/10 bg-[#1E293B] px-5 py-4">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#1976D2] mb-1">Field command</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          {greeting}, {displayName}
        </h1>
        <p className="mt-1 text-sm text-slate-400">{dateStr}</p>
      </div>
      <WeatherWidget />
    </div>
  );
}

