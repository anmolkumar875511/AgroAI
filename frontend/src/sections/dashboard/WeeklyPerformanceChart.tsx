import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useChartTheme } from '@/hooks/useChartTheme';

interface WeeklyPoint {
  name: string;
  value: number;
  value2: number;
  value3: number;
}

interface WeeklyPerformanceChartProps {
  data?: WeeklyPoint[];  // NEW — from DashboardPage API
  loading?: boolean;     // NEW
}

// Static fallback used only when backend data isn't available yet
const FALLBACK: WeeklyPoint[] = [
  { name: 'Mon', value: 3.2, value2: 4.0, value3: 2.9 },
  { name: 'Tue', value: 4.1, value2: 4.0, value3: 3.7 },
  { name: 'Wed', value: 3.8, value2: 4.0, value3: 3.4 },
  { name: 'Thu', value: 4.5, value2: 4.0, value3: 4.1 },
  { name: 'Fri', value: 3.9, value2: 5.0, value3: 3.5 },
  { name: 'Sat', value: 4.8, value2: 5.0, value3: 4.3 },
  { name: 'Sun', value: 4.2, value2: 5.0, value3: 3.8 },
];

export function WeeklyPerformanceChart({ data, loading }: WeeklyPerformanceChartProps) {
  const ct = useChartTheme();
  const chartData = data || FALLBACK;

  if (loading && !data) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-40 bg-light-gray dark:bg-white/10 rounded animate-pulse" />
          <div className="h-8 w-24 bg-light-gray dark:bg-white/10 rounded animate-pulse" />
        </div>
        <div className="h-[280px] bg-light-gray dark:bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/80 dark:bg-[#121b14]/40 rounded-2xl shadow-md border border-white/30 dark:border-white/5 p-5 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="font-semibold text-text-primary dark:text-white text-sm">Weekly Performance</h3>
        <span className="px-3.5 py-1.5 rounded-xl bg-light-gray/60 dark:bg-white/5 text-[10px] font-bold text-text-primary dark:text-white uppercase tracking-wider shadow-sm hover:scale-[1.02] transition-transform duration-300 cursor-default">
          This Week
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} />
          <YAxis tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} tickFormatter={v => `Rs.${v}L`} />
          <Tooltip contentStyle={{ backgroundColor: ct.tooltipBg, color: ct.tooltipColor, border: ct.tooltipBorder, borderRadius: '12px', boxShadow: '0 12px 48px rgba(0,0,0,0.15)', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: ct.legendColor }} />
          <Bar dataKey="value" name="Visits Completed"
            fill={ct.isDark ? 'rgba(139,195,74,0.4)' : 'rgba(27,94,32,0.3)'}
            radius={[4, 4, 0, 0]} animationDuration={800} />
          <Line type="monotone" dataKey="value2" name="Target"
            stroke={ct.isDark ? '#8BC34A' : '#1B5E20'} strokeWidth={2}
            strokeDasharray="5 5" dot={false} animationDuration={800} />
          <Line type="monotone" dataKey="value3" name="Actual Revenue"
            stroke="#8BC34A" strokeWidth={3}
            dot={{ r: 4, fill: '#8BC34A' }} animationDuration={800} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
