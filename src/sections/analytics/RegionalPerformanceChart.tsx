import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { regionalPerformanceData } from '@/data/mockData';
import { useChartTheme } from '@/hooks/useChartTheme';

export function RegionalPerformanceChart() {
  const ct = useChartTheme();

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Regional Performance</h4>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={regionalPerformanceData}>
          <PolarGrid stroke={ct.gridStroke} />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: ct.tickFill }} />
          <PolarRadiusAxis tick={{ fontSize: 9, fill: ct.tickFill }} domain={[0, 100]} />
          <Radar name="Your Territory" dataKey="yourTerritory" stroke={ct.isDark ? '#8BC34A' : '#1B5E20'} fill={ct.isDark ? '#8BC34A' : '#1B5E20'} fillOpacity={0.3} strokeWidth={2} animationDuration={800} />
          <Radar name="Average" dataKey="average" stroke={ct.tickFill} fill={ct.tickFill} fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" animationDuration={800} />
          <Legend wrapperStyle={{ fontSize: '11px', color: ct.legendColor }} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', fontSize: '13px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
