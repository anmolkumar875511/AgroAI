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
  const isCritical = data.id === 'risk-villages';
  const navigate = useNavigate();

  const handleClick = () => {
    switch (data.id) {
      case 'risk-villages':      navigate('/risk-analyzer');  break;
      case 'priority-visits':    navigate('/visit-planner');  break;
      case 'stock-alerts':       navigate('/analytics');      break;
      case 'revenue-opportunity':navigate('/analytics');      break;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`backdrop-blur-md bg-white/80 dark:bg-[#121b14]/40 rounded-2xl p-5 border border-white/30 dark:border-white/5 shadow-md hover:shadow-xl dark:hover:shadow-lime-green/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group ${
        isCritical ? 'animate-border-glow-red shadow-glow-red border-danger-red/30' : 'hover:border-deep-green/30 dark:hover:border-lime-green/30'
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm relative overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
          style={{ backgroundColor: data.iconBg, color: data.iconColor }}
        >
          {Icon && <Icon className="w-5 h-5 relative z-10 animate-pulse-slow" />}
          <div className="absolute inset-0 bg-white/10 dark:bg-white/5" />
        </div>
        <TrendIndicator value={data.trend} direction={data.trendDirection} />
      </div>

      <div className="mt-5 space-y-1">
        <div className="text-3xl lg:text-4xl font-extrabold tracking-tight text-text-primary dark:text-white transition-all">
          {data.value}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted dark:text-white/40">
          {data.title}
        </div>
      </div>

      <div className="mt-5 pt-1">
        <MiniSparkline data={data.chartData} color={data.chartColor} />
      </div>
    </div>
  );
}
