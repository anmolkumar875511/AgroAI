import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { dashboardAPI, type KPIItem } from '@/api/client';

import { DashboardGreeting } from '@/sections/dashboard/DashboardGreeting';
import { KPICard } from '@/sections/dashboard/KPICard';
import { MandiPriceCard } from '@/sections/dashboard/MandiPriceCard';
import { AIRecommendationsFeed } from '@/sections/dashboard/AIRecommendationsFeed';
import { MapWidget } from '@/sections/dashboard/MapWidget';
import { WeeklyPerformanceChart } from '@/sections/dashboard/WeeklyPerformanceChart';

// Skeleton card for loading state
function KPISkeleton() {
  return (
    <div className="bg-white dark:bg-white/5 rounded-card p-5 shadow-card animate-pulse border border-transparent dark:border-white/5">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-light-gray dark:bg-white/10" />
        <div className="w-12 h-5 rounded-full bg-light-gray dark:bg-white/10" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="w-20 h-8 rounded bg-light-gray dark:bg-white/10" />
        <div className="w-32 h-3 rounded bg-light-gray dark:bg-white/10" />
      </div>
      <div className="mt-4 h-12 rounded bg-light-gray dark:bg-white/10" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const territory_id = user?.territory_id || 'TER_0001';

  const { data, loading, error } = useApi(
    () => dashboardAPI.getDashboard(territory_id),
    [territory_id],
  );

  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !data) return;
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
    trendDirection: k.trend_direction,
    icon: k.icon,
    iconColor: k.icon_color,
    iconBg: k.icon_bg,
    chartData: k.chart_data,
    chartColor: k.chart_color,
    chartFill: k.chart_color + '22',
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-danger-red text-sm">
        Failed to load dashboard: {error}
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="dashboard-card">
        <DashboardGreeting />
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <KPISkeleton key={i} />)}
        </div>
      ) : (
        <>
          {/* Mobile: horizontal scroll */}
          <div className="block sm:hidden dashboard-card">
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-4 w-max">
                {(data?.kpis || []).map(kpi => (
                  <div key={kpi.id} className="w-[280px] flex-shrink-0">
                    <KPICard data={toKpiData(kpi)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Desktop: grid */}
          <div className="hidden sm:grid grid-cols-2 xl:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="dashboard-card">
          <AIRecommendationsFeed territoryId={territory_id} />
        </div>
        <div className="dashboard-card">
          <MapWidget />
        </div>
      </div>

      {/* Weekly Performance */}
      <div className="dashboard-card">
        <WeeklyPerformanceChart
          data={data?.weekly_performance}
          loading={loading}
        />
      </div>
    </div>
  );
}
