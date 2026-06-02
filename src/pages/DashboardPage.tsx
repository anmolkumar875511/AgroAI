import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { dashboardAPI, type KPIItem } from '@/api/client';
import { useRegion } from '@/contexts/RegionContext';


import { DashboardGreeting } from '@/sections/dashboard/DashboardGreeting';
import { KPICard } from '@/sections/dashboard/KPICard';
import { MandiPriceCard } from '@/sections/dashboard/MandiPriceCard';
import { AIRecommendationsFeed } from '@/sections/dashboard/AIRecommendationsFeed';
import { MapWidget } from '@/sections/dashboard/MapWidget';
import { WeeklyPerformanceChart } from '@/sections/dashboard/WeeklyPerformanceChart';

// Import the new Manager Dashboard Page component
import ManagerDashboard from './ManagerDashboard';

// Skeleton card for loading state
function KPISkeleton() {
  return (
    <div className="backdrop-blur-md bg-white/70 dark:bg-white/5 rounded-2xl p-5 border border-white/20 dark:border-white/10 shadow-card animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-light-gray/60 dark:bg-white/10" />
        <div className="w-12 h-5 rounded-full bg-light-gray/60 dark:bg-white/10" />
      </div>
      <div className="mt-5 space-y-3">
        <div className="w-24 h-8 rounded bg-light-gray/60 dark:bg-white/10" />
        <div className="w-36 h-3 rounded bg-light-gray/60 dark:bg-white/10" />
      </div>
      <div className="mt-5 h-12 rounded-xl bg-light-gray/60 dark:bg-white/10" />
    </div>
  );
}

function FieldRepDashboard() {
  const { user } = useAuth();
  const { activeRegion } = useRegion();
  const territory_id = activeRegion.territoryId || user?.territory_id || 'TER_0001';

  const { data, loading, error } = useApi(
    () => dashboardAPI.getDashboard(territory_id),
    [territory_id],
  );

  const pageRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (loading || !data || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dashboard-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.1 },
      );
    }, pageRef);
    return () => ctx.revert();
  }, [loading, data]);

  // Convert backend KPI shape → the shape KPICard already expects
  const toKpiData = (k: KPIItem) => ({
    id: k.id,
    title: k.title,
    value: k.value,
    trend: k.trend,
    trendDirection: k.trend_direction === 'down' ? 'down' as const : 'up' as const,
    icon: k.icon,
    iconColor: k.icon_color,
    iconBg: k.icon_bg,
    chartData: k.chart_data.map((point) => point.value),
    chartColor: k.chart_color,
    chartFill: k.chart_color + '22',
  });

  const weeklyPerformance = data?.weekly_performance?.map((point) => ({
    name: point.day,
    value: point.visits,
    value2: point.recommendations,
    value3: point.revenue / 100000,
  }));

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-danger-red text-sm">
        Failed to load dashboard: {error}
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-5 lg:space-y-6 pb-6">
      <div className="dashboard-card">
        <DashboardGreeting />
      </div>

      {/* KPI Cards */}
      {loading && !data ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          {[0, 1, 2, 3].map(i => <KPISkeleton key={i} />)}
        </div>
      ) : (
        <>
          {/* Mobile: horizontal scroll */}
          <div className="block sm:hidden dashboard-card">
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-4 w-max py-2">
                {(data?.kpis || []).map(kpi => (
                  <div key={kpi.id} className="w-[280px] flex-shrink-0">
                    <KPICard data={toKpiData(kpi)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Desktop: grid */}
          <div className="hidden sm:grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
            {(data?.kpis || []).map(kpi => (
              <div key={kpi.id} className="dashboard-card">
                <KPICard data={toKpiData(kpi)} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Mandi Prices — passes live data or falls back to internal fetch */}
      <div className="dashboard-card">
        <MandiPriceCard prices={data?.mandi_prices} />
      </div>

      {/* Middle: AI Recommendations + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <div className="dashboard-card h-[450px]">
          <AIRecommendationsFeed territoryId={territory_id} />
        </div>
        <div className="dashboard-card h-[450px]">
          <MapWidget />
        </div>
      </div>

      {/* Weekly Performance */}
      <div className="dashboard-card">
        <WeeklyPerformanceChart
          data={weeklyPerformance}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'manager') {
    return <ManagerDashboard />;
  }

  return <FieldRepDashboard />;
}
