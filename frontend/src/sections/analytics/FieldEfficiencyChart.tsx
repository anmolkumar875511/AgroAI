import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LabelList } from 'recharts';
import { useChartTheme } from '@/hooks/useChartTheme';

interface DataPoint { name: string; value: number; value2?: number; }
interface Props { data?: DataPoint[]; loading?: boolean; }

const FALLBACK: DataPoint[] = [
  { name: 'Week 1', value: 4, value2: 5 }, { name: 'Week 2', value: 4, value2: 5 },
  { name: 'Week 3', value: 5, value2: 5 }, { name: 'Week 4', value: 5, value2: 5 },
];

const formatVisitCount = (value: number | string) => Math.round(Number(value)).toString();

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 animate-pulse">
      <div className="h-5 w-40 bg-light-gray dark:bg-white/10 rounded mb-4" />
      <div className="h-[250px] bg-light-gray dark:bg-white/10 rounded" />
    </div>
  );
}

export function FieldEfficiencyChart({ data, loading }: Props) {
  const ct = useChartTheme();
  const chartData = data || FALLBACK;
  if (loading) return <ChartSkeleton />;
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Field Efficiency</h4>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={chartData} margin={{ top: 18, right: 16, left: 12, bottom: 18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: ct.tickFill }}
            axisLine={{ stroke: ct.axisStroke }}
            label={{ value: '', position: 'insideBottom', offset: -12, fill: ct.tickFill, fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: ct.tickFill }}
            axisLine={{ stroke: ct.axisStroke }}
            allowDecimals={false}
            tickFormatter={formatVisitCount}
            label={{ value: 'Visit count', angle: -90, position: 'insideLeft', fill: ct.tickFill, fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => formatVisitCount(value as number | string)}
            contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, fontSize: '13px' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', color: ct.legendColor }} />
          <Bar dataKey="value" name="Visit Count" fill={ct.isDark ? '#8BC34A' : '#1B5E20'} radius={[4,4,0,0]} animationDuration={800}>
            <LabelList dataKey="value" position="top" formatter={formatVisitCount} fill={ct.tickFill} fontSize={11} />
          </Bar>
          <Line type="monotone" dataKey="value2" name="Target visits" stroke={ct.isDark ? '#66BB6A' : '#8BC34A'} strokeWidth={2} strokeDasharray="5 5" dot={false} animationDuration={800} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
