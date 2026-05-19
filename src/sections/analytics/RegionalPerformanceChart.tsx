// src/sections/analytics/RegionalPerformanceChart.tsx
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { useChartTheme } from '@/hooks/useChartTheme';

interface DataPoint { metric: string; yourTerritory: number; average: number; }
interface Props { data?: DataPoint[]; loading?: boolean; }

const FALLBACK: DataPoint[] = [
  { metric: 'Visits',       yourTerritory: 85, average: 65 },
  { metric: 'Revenue',      yourTerritory: 92, average: 70 },
  { metric: 'Acceptance',   yourTerritory: 87, average: 72 },
  { metric: 'Coverage',     yourTerritory: 78, average: 60 },
  { metric: 'Satisfaction', yourTerritory: 90, average: 75 },
];

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 animate-pulse">
      <div className="h-5 w-48 bg-light-gray dark:bg-white/10 rounded mb-4" />
      <div className="h-[250px] bg-light-gray dark:bg-white/10 rounded" />
    </div>
  );
}

export function RegionalPerformanceChart({ data, loading }: Props) {
  const ct = useChartTheme();
  const chartData = data || FALLBACK;
  if (loading) return <ChartSkeleton />;
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Regional Performance</h4>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke={ct.gridStroke} />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: ct.tickFill }} />
          <PolarRadiusAxis tick={{ fontSize: 9, fill: ct.tickFill }} domain={[0, 100]} />
          <Radar name="Your Territory" dataKey="yourTerritory" stroke={ct.isDark ? '#8BC34A' : '#1B5E20'} fill={ct.isDark ? '#8BC34A' : '#1B5E20'} fillOpacity={0.3} strokeWidth={2} animationDuration={800} />
          <Radar name="Average" dataKey="average" stroke={ct.tickFill} fill={ct.tickFill} fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" animationDuration={800} />
          <Legend wrapperStyle={{ fontSize: '11px', color: ct.legendColor }} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, fontSize: '13px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}