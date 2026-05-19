// src/sections/analytics/RevenuePerVisitChart.tsx
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useChartTheme } from '@/hooks/useChartTheme';

interface DataPoint { name: string; value: number; value2?: number; }
interface Props { data?: DataPoint[]; loading?: boolean; }

const FALLBACK: DataPoint[] = [
  { name: 'Week 1', value: 8200, value2: 8600 }, { name: 'Week 2', value: 9100, value2: 9500 },
  { name: 'Week 3', value: 7800, value2: 8200 }, { name: 'Week 4', value: 10200, value2: 10800 },
];

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 animate-pulse">
      <div className="h-5 w-40 bg-light-gray dark:bg-white/10 rounded mb-4" />
      <div className="h-[250px] bg-light-gray dark:bg-white/10 rounded" />
    </div>
  );
}

export function RevenuePerVisitChart({ data, loading }: Props) {
  const ct = useChartTheme();
  const chartData = data || FALLBACK;
  if (loading) return <ChartSkeleton />;
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Revenue Per Visit</h4>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} />
          <YAxis tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, fontSize: '13px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: ct.legendColor }} />
          <Bar dataKey="value" name="Revenue" fill="#8BC34A" radius={[4,4,0,0]} animationDuration={800} />
          <Line type="monotone" dataKey="value2" name="Trend" stroke={ct.isDark ? '#66BB6A' : '#1B5E20'} strokeWidth={2} dot={{ r: 3 }} animationDuration={800} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}