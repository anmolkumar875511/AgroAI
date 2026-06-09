import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useChartTheme } from '@/hooks/useChartTheme';

interface StockItem { product: string; utilization: number; stock: number; status: string; }
interface Props { data?: StockItem[]; loading?: boolean; }

const FALLBACK: StockItem[] = [
  { product: 'Amistar',  utilization: 85, stock: 22,  status: 'critical' },
  { product: 'Actara',   utilization: 45, stock: 180, status: 'optimal'  },
  { product: 'Score',    utilization: 72, stock: 56,  status: 'low'      },
  { product: 'Ridomil',  utilization: 68, stock: 34,  status: 'low'      },
  { product: 'Custodia', utilization: 30, stock: 145, status: 'optimal'  },
  { product: 'Proclaim', utilization: 55, stock: 92,  status: 'optimal'  },
];

const STATUS_COLORS: Record<string, string> = {
  optimal:  '#8BC34A',
  low:      '#FFC107',
  critical: '#E53935',
};

function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 animate-pulse">
      <div className="h-5 w-40 bg-light-gray dark:bg-white/10 rounded mb-4" />
      <div className="h-[250px] bg-light-gray dark:bg-white/10 rounded" />
    </div>
  );
}

export function StockUtilizationChart({ data, loading }: Props) {
  const ct = useChartTheme();
  const chartData = data || FALLBACK;
  if (loading) return <ChartSkeleton />;
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Stock Utilization</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 34, left: 12, bottom: 18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: ct.tickFill }}
            axisLine={{ stroke: ct.axisStroke }}
            tickFormatter={v => `${v}%`}
            label={{ value: 'Stock utilization (%)', position: 'insideBottom', offset: -12, fill: ct.tickFill, fontSize: 12 }}
          />
          <YAxis
            dataKey="product"
            type="category"
            tick={{ fontSize: 11, fill: ct.tickFill }}
            axisLine={{ stroke: ct.axisStroke }}
            width={72}
            label={{ value: 'Product', angle: -90, position: 'insideLeft', fill: ct.tickFill, fontSize: 12 }}
          />
          <Tooltip
            formatter={(value, name) => name === 'Utilization %' ? `${value}%` : value}
            contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, fontSize: '13px' }}
          />
          <Bar dataKey="utilization" name="Utilization %" radius={[0,4,4,0]} animationDuration={800}>
            <LabelList dataKey="utilization" position="right" formatter={(value: number | string) => `${value}%`} fill={ct.tickFill} fontSize={11} />
            {chartData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.status] || '#8BC34A'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
