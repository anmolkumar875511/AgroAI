import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useChartTheme } from '@/hooks/useChartTheme';

interface WeeklyPoint {
  name: string;
  value: number; // Visits Completed
  value2: number; // AI Recommendations
  value3: number; // Revenue Generated in lakhs
}

interface WeeklyPerformanceChartProps {
  data?: WeeklyPoint[];
  loading?: boolean;
}

const FALLBACK: WeeklyPoint[] = [
  { name: 'Mon', value: 3, value2: 4, value3: 2.9 },
  { name: 'Tue', value: 4, value2: 5, value3: 3.7 },
  { name: 'Wed', value: 4, value2: 4, value3: 3.4 },
  { name: 'Thu', value: 5, value2: 6, value3: 4.1 },
  { name: 'Fri', value: 4, value2: 5, value3: 3.5 },
  { name: 'Sat', value: 5, value2: 6, value3: 4.3 },
  { name: 'Sun', value: 4, value2: 5, value3: 3.8 },
];

export function WeeklyPerformanceChart({
  data,
  loading,
}: WeeklyPerformanceChartProps) {
  const ct = useChartTheme();

  const chartData = data || FALLBACK;

  const totalVisits = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const totalRecommendations = chartData.reduce(
    (sum, item) => sum + item.value2,
    0
  );

  const totalRevenue = chartData.reduce(
    (sum, item) => sum + item.value3,
    0
  );

  const averageRevenuePerVisit = totalVisits > 0
    ? totalRevenue / totalVisits
    : 0;

  const bestRevenueDay = chartData.reduce(
    (best, item) => (item.value3 > best.value3 ? item : best),
    chartData[0] || FALLBACK[0]
  );

  const formatCount = (value: number | undefined) =>
    typeof value === 'number' ? value.toFixed(0) : '0';

  const formatLakhs = (value: number | undefined) =>
    `₹${(value || 0).toFixed(1)}L`;

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: any) => {
    if (!active || !payload?.length) return null;

    const visits = payload.find((item: any) => item.dataKey === 'value')?.value;
    const recommendations = payload.find((item: any) => item.dataKey === 'value2')?.value;
    const revenue = payload.find((item: any) => item.dataKey === 'value3')?.value;

    return (
      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#182219] p-3 shadow-xl min-w-[220px]">
        <p className="font-semibold text-sm mb-2 text-text-primary dark:text-white">
          {label} performance
        </p>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between gap-6">
            <span className="text-text-secondary dark:text-white/70">
              Field visits
            </span>
            <span className="font-semibold text-text-primary dark:text-white">
              {formatCount(visits)}
            </span>
          </div>

          <div className="flex justify-between gap-6">
            <span className="text-text-secondary dark:text-white/70">
              AI recommendations
            </span>
            <span className="font-semibold text-text-primary dark:text-white">
              {formatCount(recommendations)}
            </span>
          </div>

          <div className="flex justify-between gap-6">
            <span className="text-text-secondary dark:text-white/70">
              Revenue generated
            </span>
            <span className="font-semibold text-text-primary dark:text-white">
              {formatLakhs(revenue)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !data) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-40 bg-light-gray dark:bg-white/10 rounded animate-pulse" />
          <div className="h-8 w-24 bg-light-gray dark:bg-white/10 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="h-20 bg-light-gray dark:bg-white/10 rounded-xl animate-pulse" />
          <div className="h-20 bg-light-gray dark:bg-white/10 rounded-xl animate-pulse" />
          <div className="h-20 bg-light-gray dark:bg-white/10 rounded-xl animate-pulse" />
        </div>

        <div className="h-[280px] bg-light-gray dark:bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/80 dark:bg-[#121b14]/40 rounded-2xl shadow-md border border-white/30 dark:border-white/5 p-5 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="font-semibold text-text-primary dark:text-white text-base">
            Weekly Business Performance
          </h3>

          <p className="text-xs text-text-secondary dark:text-white/50 mt-1">
            Daily field visits, AI recommendations, and revenue generated for
            this territory.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-light-gray/60 dark:bg-white/5 text-[10px] font-bold text-text-primary dark:text-white uppercase tracking-wider shadow-sm">
          This Week
        </span>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="rounded-xl bg-light-gray/50 dark:bg-white/5 border border-black/5 dark:border-white/5 p-3">
          <p className="text-[10px] uppercase tracking-wide text-text-secondary dark:text-white/50">
            Field Visits
          </p>

          <p className="text-lg font-bold text-text-primary dark:text-white mt-1">
            {formatCount(totalVisits)}
          </p>
        </div>

        <div className="rounded-xl bg-light-gray/50 dark:bg-white/5 border border-black/5 dark:border-white/5 p-3">
          <p className="text-[10px] uppercase tracking-wide text-text-secondary dark:text-white/50">
            AI Recommendations
          </p>

          <p className="text-lg font-bold text-text-primary dark:text-white mt-1">
            {formatCount(totalRecommendations)}
          </p>
        </div>

        <div className="rounded-xl bg-light-gray/50 dark:bg-white/5 border border-black/5 dark:border-white/5 p-3">
          <p className="text-[10px] uppercase tracking-wide text-text-secondary dark:text-white/50">
            Revenue
          </p>

          <p className="text-lg font-bold text-text-primary dark:text-white mt-1">
            {formatLakhs(totalRevenue)}
          </p>
        </div>

        <div className="rounded-xl bg-light-gray/50 dark:bg-white/5 border border-black/5 dark:border-white/5 p-3">
          <p className="text-[10px] uppercase tracking-wide text-text-secondary dark:text-white/50">
            Revenue / Visit
          </p>

          <p className="text-lg font-bold text-text-primary dark:text-white mt-1">
            {formatLakhs(averageRevenuePerVisit)}
          </p>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#2563eb]/70" />
            <span className="text-text-secondary dark:text-white/70">
              Field visits
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 border-t-2 border-[#7c3aed]" />
            <span className="text-text-secondary dark:text-white/70">
              AI recommendations
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 border-t-2 border-[#16a34a]" />
            <span className="text-text-secondary dark:text-white/70">
              Revenue (₹ lakhs)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted dark:text-white/40">
            Left axis
          </span>
          <span className="text-text-secondary dark:text-white/70">count</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted dark:text-white/40">
            Right axis
          </span>
          <span className="text-text-secondary dark:text-white/70">₹ lakhs</span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart
          data={chartData}
          margin={{ top: 12, right: 10, bottom: 8, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={ct.gridStroke}
          />

          <XAxis
            dataKey="name"
            tick={{
              fontSize: 11,
              fill: ct.tickFill,
            }}
            axisLine={{
              stroke: ct.axisStroke,
            }}
            tickLine={false}
          />

          <YAxis
            yAxisId="count"
            allowDecimals={false}
            tick={{
              fontSize: 11,
              fill: ct.tickFill,
            }}
            axisLine={{
              stroke: ct.axisStroke,
            }}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
            label={{
              value: 'Visits & recommendations',
              angle: -90,
              position: 'insideLeft',
              offset: 8,
              style: {
                textAnchor: 'middle',
                fontSize: 11,
                fill: ct.tickFill,
              },
            }}
          />

          <YAxis
            yAxisId="revenue"
            orientation="right"
            tick={{
              fontSize: 11,
              fill: ct.tickFill,
            }}
            axisLine={{
              stroke: ct.axisStroke,
            }}
            tickLine={false}
            tickFormatter={(v) => `₹${v}L`}
            label={{
              value: 'Revenue',
              angle: 90,
              position: 'insideRight',
              offset: -2,
              style: {
                textAnchor: 'middle',
                fontSize: 11,
                fill: ct.tickFill,
              },
            }}
          />

          <Tooltip
            cursor={{ fill: ct.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(27,94,32,0.04)' }}
            content={<CustomTooltip />}
          />

          <Bar
            yAxisId="count"
            dataKey="value"
            name="Field visits"
            fill={ct.isDark ? 'rgba(96,165,250,0.55)' : 'rgba(37,99,235,0.55)'}
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />

          <Line
            yAxisId="count"
            type="monotone"
            dataKey="value2"
            name="AI recommendations"
            stroke={ct.isDark ? '#a78bfa' : '#7c3aed'}
            strokeWidth={2}
            dot={{
              r: 3,
              fill: ct.isDark ? '#a78bfa' : '#7c3aed',
            }}
            animationDuration={800}
          />

          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="value3"
            name="Revenue generated"
            stroke={ct.isDark ? '#86efac' : '#16a34a'}
            strokeWidth={3}
            dot={{
              r: 4,
              fill: ct.isDark ? '#86efac' : '#16a34a',
            }}
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Footer Insight */}
      <div className="mt-4 rounded-xl border border-black/5 dark:border-white/5 bg-light-gray/40 dark:bg-white/[0.03] p-3">
        <p className="text-xs text-text-secondary dark:text-white/60">
          <span className="font-semibold text-text-primary dark:text-white">
            Weekly Summary:
          </span>{' '}
          {bestRevenueDay.name} produced the highest revenue at{' '}
          <span className="font-semibold text-text-primary dark:text-white">
            {formatLakhs(bestRevenueDay.value3)}
          </span>
          . Use the count axis for visits and recommendations, and the right
          axis for revenue.
        </p>
      </div>
    </div>
  );
}
