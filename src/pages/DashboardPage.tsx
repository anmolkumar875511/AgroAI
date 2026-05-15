import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { DashboardGreeting } from '@/sections/dashboard/DashboardGreeting';
import { KPICard } from '@/sections/dashboard/KPICard';
import { MandiPriceCard } from '@/sections/dashboard/MandiPriceCard';
import { AIRecommendationsFeed } from '@/sections/dashboard/AIRecommendationsFeed';
import { MapWidget } from '@/sections/dashboard/MapWidget';
import { WeeklyPerformanceChart } from '@/sections/dashboard/WeeklyPerformanceChart';
import { kpiData } from '@/data/mockData';

export default function DashboardPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dashboard-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power2.out',
          delay: 0.3,
        }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="space-y-6">
      {/* Greeting */}
      <div className="dashboard-card">
        <DashboardGreeting />
      </div>

      {/* KPI Cards — swipeable on mobile */}
      <div className="block sm:hidden dashboard-card">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-4 w-max">
            {kpiData.map((kpi) => (
              <div key={kpi.id} className="w-[280px] flex-shrink-0">
                <KPICard data={kpi} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden sm:grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <div key={kpi.id} className="dashboard-card">
            <KPICard data={kpi} />
          </div>
        ))}
      </div>

      {/* Mandi Prices */}
      <div className="dashboard-card">
        <MandiPriceCard />
      </div>

      {/* Middle Section: Recommendations + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="dashboard-card">
          <AIRecommendationsFeed />
        </div>
        <div className="dashboard-card">
          <MapWidget />
        </div>
      </div>

      {/* Bottom: Weekly Performance */}
      <div className="dashboard-card">
        <WeeklyPerformanceChart />
      </div>
    </div>
  );
}
