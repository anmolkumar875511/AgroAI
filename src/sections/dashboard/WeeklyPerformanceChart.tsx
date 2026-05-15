import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { weeklyPerformanceData } from '@/data/mockData';
import { useChartTheme } from '@/hooks/useChartTheme';

export function WeeklyPerformanceChart() {
  const ct = useChartTheme();

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-text-primary dark:text-white">Weekly Performance</h3>
        <span className="px-3 py-1.5 rounded-button bg-light-gray dark:bg-white/5 text-xs font-medium text-text-primary dark:text-white cursor-pointer">
          This Week
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={weeklyPerformanceData}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: ct.tickFill }}
            axisLine={{ stroke: ct.axisStroke }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: ct.tickFill }}
            axisLine={{ stroke: ct.axisStroke }}
            tickFormatter={(v) => `Rs.${v}L`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: ct.tooltipBg,
              color: ct.tooltipColor,
              border: ct.tooltipBorder,
              borderRadius: '12px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
              fontSize: '13px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '16px', color: ct.legendColor }}
          />
          <Bar
            dataKey="value"
            name="Visits Completed"
            fill={ct.isDark ? 'rgba(139, 195, 74, 0.4)' : 'rgba(27, 94, 32, 0.3)'}
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="value2"
            name="Target"
            stroke={ct.isDark ? '#8BC34A' : '#1B5E20'}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="value3"
            name="Actual Revenue"
            stroke="#8BC34A"
            strokeWidth={3}
            dot={{ r: 4, fill: '#8BC34A' }}
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
