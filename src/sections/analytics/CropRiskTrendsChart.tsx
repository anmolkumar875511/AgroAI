// src/sections/analytics/CropRiskTrendsChart.tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useChartTheme } from '@/hooks/useChartTheme';

interface DataPoint { month: string; rice: number; cotton: number; wheat: number; }
interface Props { data?: DataPoint[]; loading?: boolean; }

const FALLBACK: DataPoint[] = [
  { month: 'Jan', rice: 12, cotton: 8,  wheat: 20 },
  { month: 'Feb', rice: 18, cotton: 12, wheat: 15 },
  { month: 'Mar', rice: 15, cotton: 10, wheat: 12 },
  { month: 'Apr', rice: 22, cotton: 15, wheat: 8  },
  { month: 'May', rice: 28, cotton: 20, wheat: 10 },
  { month: 'Jun', rice: 35, cotton: 18, wheat: 12 },
  { month: 'Jul', rice: 42, cotton: 25, wheat: 9  },
];

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 animate-pulse">
      <div className="h-5 w-40 bg-light-gray dark:bg-white/10 rounded mb-4" />
      <div className="h-[250px] bg-light-gray dark:bg-white/10 rounded" />
    </div>
  );
}

export function CropRiskTrendsChart({ data, loading }: Props) {
  const ct = useChartTheme();
  const chartData = data || FALLBACK;
  if (loading) return <ChartSkeleton />;
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Crop Risk Trends</h4>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} />
          <YAxis tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} tickFormatter={v => `${v}%`} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, fontSize: '13px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: ct.legendColor }} />
          <Area type="monotone" dataKey="rice"   name="Rice"   stackId="1" stroke="#8BC34A" fill="rgba(139,195,74,0.3)"  animationDuration={800} />
          <Area type="monotone" dataKey="cotton" name="Cotton" stackId="1" stroke="#FFC107" fill="rgba(255,193,7,0.3)"   animationDuration={800} />
          <Area type="monotone" dataKey="wheat"  name="Wheat"  stackId="1" stroke="#1E88E5" fill="rgba(30,136,229,0.3)"  animationDuration={800} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}