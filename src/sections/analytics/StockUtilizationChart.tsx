import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { stockUtilizationData } from '@/data/mockData';
import { useChartTheme } from '@/hooks/useChartTheme';

const statusColors: Record<string, string> = {
  optimal: '#8BC34A',
  low: '#FFC107',
  critical: '#E53935',
};

export function StockUtilizationChart() {
  const ct = useChartTheme();

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Stock Utilization</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={stockUtilizationData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
          <XAxis type="number" tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} tickFormatter={(v) => `${v}%`} />
          <YAxis dataKey="product" type="category" tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} width={80} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', fontSize: '13px' }} />
          <Bar dataKey="utilization" name="Utilization %" radius={[0, 4, 4, 0]} animationDuration={800}>
            {stockUtilizationData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={statusColors[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
