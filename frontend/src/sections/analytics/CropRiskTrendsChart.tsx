import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const totals = chartData.reduce(
    (acc, item) => ({
      high: acc.high + item.high,
      medium: acc.medium + item.medium,
      low: acc.low + item.low,
    }),
    { high: 0, medium: 0, low: 0 },
  );

  if (loading) return <ChartSkeleton />;
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 lg:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div>
          <h4 className="font-semibold text-text-primary dark:text-white">Crop Risk Distribution</h4>
          <p className="text-xs text-text-muted mt-1">Monthly risk load by severity</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="px-3 py-1 rounded-full bg-danger-red/10 text-danger-red">High {totals.high}</span>
          <span className="px-3 py-1 rounded-full bg-yellow-400/15 text-yellow-700 dark:text-yellow-300">Medium {totals.medium}</span>
          <span className="px-3 py-1 rounded-full bg-lime-green/15 text-deep-green dark:text-lime-green">Low {totals.low}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barCategoryGap="24%" margin={{ top: 12, right: 16, left: 12, bottom: 18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: ct.tickFill }}
            axisLine={{ stroke: ct.axisStroke }}
            label={{ value: 'Month', position: 'insideBottom', offset: -12, fill: ct.tickFill, fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: ct.tickFill }}
            axisLine={{ stroke: ct.axisStroke }}
            allowDecimals={false}
            label={{ value: 'Risk cases', angle: -90, position: 'insideLeft', fill: ct.tickFill, fontSize: 12 }}
          />
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, fontSize: '13px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: ct.legendColor }} />
          <Bar dataKey="high" name="High Risk" stackId="risk" fill="#E53935" radius={[0, 0, 4, 4]} animationDuration={800} />
          <Bar dataKey="medium" name="Medium Risk" stackId="risk" fill="#FFC107" animationDuration={800} />
          <Bar dataKey="low" name="Low Risk" stackId="risk" fill="#8BC34A" radius={[4, 4, 0, 0]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
