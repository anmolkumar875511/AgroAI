import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useChartTheme } from '@/hooks/useChartTheme';

interface DataPoint { month: string; high: number; medium: number; low: number; }
interface Props { data?: DataPoint[]; loading?: boolean; }

const FALLBACK: DataPoint[] = [
  { month: 'Jan', high: 12, medium: 8,  low: 20 },
  { month: 'Feb', high: 18, medium: 12, low: 15 },
  { month: 'Mar', high: 15, medium: 10, low: 12 },
  { month: 'Apr', high: 22, medium: 15, low: 8  },
  { month: 'May', high: 28, medium: 20, low: 10 },
  { month: 'Jun', high: 35, medium: 18, low: 12 },
  { month: 'Jul', high: 42, medium: 25, low: 9  },
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
          <YAxis tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, fontSize: '13px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: ct.legendColor }} />
          <Area type="monotone" dataKey="high"   name="High Risk"   stackId="1" stroke="#E53935" fill="rgba(229,57,53,0.25)"  animationDuration={800} />
          <Area type="monotone" dataKey="medium" name="Medium Risk" stackId="1" stroke="#FFC107" fill="rgba(255,193,7,0.25)"   animationDuration={800} />
          <Area type="monotone" dataKey="low"    name="Low Risk"    stackId="1" stroke="#8BC34A" fill="rgba(139,195,74,0.25)"  animationDuration={800} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
