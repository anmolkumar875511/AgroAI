/**
 * Field operations dashboard — live AI feed, command KPIs, geo map, operational metrics.
 */
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
import { LiveAIActivityFeed } from '@/components/command-center/LiveAIActivityFeed';
import { OperationalCommandMetrics } from '@/components/command-center/OperationalCommandMetrics';
import { SmartAlertCenter } from '@/components/command-center/SmartAlertCenter';

function KPISkeleton() {
  return (
    <div className="rounded-xl bg-[#1E293B] border border-white/10 p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-white/10" />
        <div className="w-12 h-5 rounded-full bg-white/10" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="w-20 h-8 rounded bg-white/10" />
        <div className="w-32 h-3 rounded bg-white/10" />
      </div>
      <div className="mt-4 h-12 rounded bg-white/10" />
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
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out', delay: 0.05 },
      );
    }, pageRef);
    return () => ctx.revert();
  }, [loading, data]);

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
      <div className="flex items-center justify-center h-64 text-[#D32F2F] text-sm">
        Failed to load dashboard: {error}
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="dashboard-card">
        <DashboardGreeting />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
        <div className="dashboard-card">
          <LiveAIActivityFeed />
        </div>
        <div className="dashboard-card">
          <SmartAlertCenter />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <KPISkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="block sm:hidden dashboard-card">
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-4 w-max">
                {(data?.kpis || []).map((kpi) => (
                  <div key={kpi.id} className="w-[280px] flex-shrink-0">
                    <KPICard data={toKpiData(kpi)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden sm:grid grid-cols-2 xl:grid-cols-4 gap-4">
            {(data?.kpis || []).map((kpi) => (
              <div key={kpi.id} className="dashboard-card">
                <KPICard data={toKpiData(kpi)} />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="dashboard-card">
        <MandiPriceCard prices={data?.mandi_prices} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="dashboard-card min-h-[420px]">
          <AIRecommendationsFeed territoryId={territory_id} />
        </div>
        <div className="dashboard-card min-h-[420px]">
          <MapWidget />
        </div>
      </div>

      <div className="dashboard-card">
        <OperationalCommandMetrics />
      </div>
    </div>
  );
}
