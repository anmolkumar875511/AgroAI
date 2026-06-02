import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useChartTheme } from '@/hooks/useChartTheme';

interface DataPoint { name: string; value: number; fill: string; }
interface Props { data?: DataPoint[]; loading?: boolean; }

const FALLBACK: DataPoint[] = [
  { name: 'Accepted', value: 87, fill: '#8BC34A' },
  { name: 'Pending',  value: 9,  fill: '#FFC107' },
  { name: 'Rejected', value: 4,  fill: '#E53935' },
];

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 animate-pulse">
      <div className="h-5 w-48 bg-light-gray dark:bg-white/10 rounded mb-4" />
      <div className="h-[250px] bg-light-gray dark:bg-white/10 rounded" />
    </div>
  );
}

export function RecommendationAcceptanceChart({ data, loading }: Props) {
  const ct = useChartTheme();
  const chartData = data || FALLBACK;
  if (loading) return <ChartSkeleton />;
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Recommendation Acceptance</h4>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" animationDuration={800}>
            {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, fontSize: '13px' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-4">
        <span className="text-2xl font-extrabold text-lime-green">{chartData[0]?.value ?? 87}%</span>
        <span className="text-xs text-text-muted ml-1">acceptance rate</span>
      </div>
      <div className="flex justify-center gap-4 mt-3">
        {chartData.map(e => (
          <div key={e.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.fill }} />
            <span className="text-[11px] text-text-muted">{e.name}: {e.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
