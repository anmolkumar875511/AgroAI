import { useAuth } from '@/contexts/AuthContext';
import { WeatherWidget } from '@/components/shared/WeatherWidget';

export function DashboardGreeting() {
  const { user } = useAuth();

  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = user?.name?.split(' ')[0] || 'Agent';
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{dateStr}</p>
      </div>
      <WeatherWidget />
    </div>
  );
}
