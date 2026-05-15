import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cropRiskTrendsData } from '@/data/mockData';
import { useChartTheme } from '@/hooks/useChartTheme';

export function CropRiskTrendsChart() {
  const ct = useChartTheme();

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Crop Risk Trends</h4>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={cropRiskTrendsData}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} />
          <YAxis tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} tickFormatter={(v) => `${v}%`} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', fontSize: '13px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: ct.legendColor }} />
          <Area type="monotone" dataKey="rice" name="Rice" stackId="1" stroke="#8BC34A" fill="rgba(139,195,74,0.3)" animationDuration={800} />
          <Area type="monotone" dataKey="cotton" name="Cotton" stackId="1" stroke="#FFC107" fill="rgba(255,193,7,0.3)" animationDuration={800} />
          <Area type="monotone" dataKey="wheat" name="Wheat" stackId="1" stroke="#1E88E5" fill="rgba(30,136,229,0.3)" animationDuration={800} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
