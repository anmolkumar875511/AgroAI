import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { recommendationAcceptanceData } from '@/data/mockData';
import { useChartTheme } from '@/hooks/useChartTheme';

export function RecommendationAcceptanceChart() {
  const ct = useChartTheme();
  const data = recommendationAcceptanceData;

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Recommendation Acceptance</h4>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, boxShadow: '0 12px 48px rgba(0,0,0,0.15)', fontSize: '13px' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-4">
        <span className="text-2xl font-extrabold text-lime-green">87%</span>
        <span className="text-xs text-text-muted ml-1">acceptance rate</span>
      </div>
      <div className="flex justify-center gap-4 mt-3">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
            <span className="text-[11px] text-text-muted">{entry.name}: {entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
