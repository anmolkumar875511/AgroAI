import { AlertTriangle, MapPin, Package, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleClick = () => {
    switch (data.id) {
      case 'risk-villages': navigate('/risk-analyzer'); break;
      case 'priority-visits': navigate('/visit-planner'); break;
      case 'stock-alerts': navigate('/analytics'); break;
      case 'revenue-opportunity': navigate('/analytics'); break;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`rounded-xl border border-white/10 bg-[#1E293B] p-5 hover:border-[#1976D2]/25 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${
        isCritical ? 'border-[#D32F2F]/40 ops-alert-pulse' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5"
          style={{ backgroundColor: data.iconBg, color: data.iconColor }}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <TrendIndicator value={data.trend} direction={data.trendDirection} />
      </div>

      <div className="mt-4">
        <div className="text-2xl lg:text-3xl font-extrabold text-white tabular-nums font-mono">
          {data.value}
        </div>
        <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
          {data.title}
        </div>
      </div>

      <div className="mt-4 opacity-60">
        <MiniSparkline data={data.chartData} color={data.chartColor} fillColor={data.chartFill} />
      </div>
    </div>
  );
}

