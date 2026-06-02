import { AlertTriangle, MapPin, Package, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MiniSparkline } from '@/components/shared/MiniSparkline';
import { TrendIndicator } from '@/components/shared/TrendIndicator';
import type { KPIData } from '@/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle, MapPin, Package, TrendingUp,
};

interface KPICardProps {
  data: KPIData;
}

export function KPICard({ data }: KPICardProps) {
  const Icon = iconMap[data.icon];
  const isCritical = data.id === 'risk-villages' || data.id === 'stock_alerts' || data.id === 'stock-alerts';
  const navigate = useNavigate();

  const handleClick = () => {
    switch (data.id) {
      case 'risk-villages':
        navigate('/risk-analyzer');
        break;
      case 'priority-visits':
      case 'visits':
        navigate('/visit-planner');
        break;
      case 'stock-alerts':
      case 'stock_alerts':
      case 'revenue-opportunity':
      case 'revenue':
        navigate('/analytics');
        break;
      case 'recommendations':
        navigate('/recommendations');
        break;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`backdrop-blur-md bg-white/80 dark:bg-[#121b14]/40 rounded-2xl p-4 border border-white/30 dark:border-white/5 shadow-md hover:shadow-xl dark:hover:shadow-lime-green/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group ${
        isCritical ? 'animate-border-glow-red shadow-glow-red border-danger-red/30' : 'hover:border-deep-green/30 dark:hover:border-lime-green/30'
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9.5 h-9.5 rounded-xl flex items-center justify-center shadow-sm relative overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
          style={{ backgroundColor: data.iconBg, color: data.iconColor }}
        >
          {Icon && <Icon className="w-4.5 h-4.5 relative z-10 animate-pulse-slow" />}
          <div className="absolute inset-0 bg-white/10 dark:bg-white/5" />
        </div>
        <TrendIndicator value={data.trend} direction={data.trendDirection} />
      </div>

      <div className="mt-4 space-y-0.5">
        <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-text-primary dark:text-white transition-all">
          {data.value}
        </div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-text-muted dark:text-white/40">
          {data.title}
        </div>
      </div>

      <div className="mt-4 pt-0.5">
        <MiniSparkline data={data.chartData} color={data.chartColor} />
      </div>
    </div>
  );
}
