import { AlertTriangle, MapPin, Package, TrendingUp } from 'lucide-react';
import { MiniSparkline } from '@/components/shared/MiniSparkline';
import { TrendIndicator } from '@/components/shared/TrendIndicator';
import type { KPIData } from '@/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  MapPin,
  Package,
  TrendingUp,
};

interface KPICardProps {
  data: KPIData;
}

export function KPICard({ data }: KPICardProps) {
  const Icon = iconMap[data.icon];
  const isCritical = data.id === 'risk-villages';

  return (
    <div
      className={`bg-white dark:bg-white/5 rounded-card p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 border border-transparent dark:border-white/5 ${
        isCritical ? 'animate-border-glow-red' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: data.iconBg, color: data.iconColor }}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <TrendIndicator value={data.trend} direction={data.trendDirection} />
      </div>

      <div className="mt-4">
        <div className="text-2xl lg:text-3xl font-extrabold text-text-primary dark:text-white">
          {data.value}
        </div>
        <div className="mt-1 text-xs font-medium uppercase tracking-wider text-text-muted">
          {data.title}
        </div>
      </div>

      <div className="mt-4">
        <MiniSparkline data={data.chartData} color={data.chartColor} fillColor={data.chartFill} />
      </div>
    </div>
  );
}
