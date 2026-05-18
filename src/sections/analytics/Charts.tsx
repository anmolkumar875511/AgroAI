// src/sections/analytics/FieldEfficiencyChart.tsx  — CHANGED
// Added: data and loading props. Falls back to static mock if data is null.
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';
import { useChartTheme } from '@/hooks/useChartTheme';

interface DataPoint { name: string; value: number; value2?: number; }
interface Props { data?: DataPoint[]; loading?: boolean; }

const FALLBACK: DataPoint[] = [
  { name: 'Week 1', value: 4.2, value2: 5 }, { name: 'Week 2', value: 3.8, value2: 5 },
  { name: 'Week 3', value: 5.1, value2: 5 }, { name: 'Week 4', value: 4.7, value2: 5 },
];

export function FieldEfficiencyChart({ data, loading }: Props) {
  const ct = useChartTheme();
  const chartData = data || FALLBACK;
  if (loading) return <ChartSkeleton title="Field Efficiency" />;
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Field Efficiency</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} />
          <YAxis tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, fontSize: '13px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: ct.legendColor }} />
          <Bar dataKey="value" name="Visits/Day" fill={ct.isDark ? '#8BC34A' : '#1B5E20'} radius={[4,4,0,0]} animationDuration={800} />
          <Line type="monotone" dataKey="value2" name="Target" stroke={ct.isDark ? '#66BB6A' : '#8BC34A'} strokeWidth={2} strokeDasharray="5 5" dot={false} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// src/sections/analytics/RevenuePerVisitChart.tsx
import { ComposedChart } from 'recharts';

interface RevenueProps { data?: DataPoint[]; loading?: boolean; }

const REVENUE_FALLBACK: DataPoint[] = [
  { name: 'Week 1', value: 8200, value2: 8600 }, { name: 'Week 2', value: 9100, value2: 9500 },
  { name: 'Week 3', value: 7800, value2: 8200 }, { name: 'Week 4', value: 10200, value2: 10800 },
];

export function RevenuePerVisitChart({ data, loading }: RevenueProps) {
  const ct = useChartTheme();
  const chartData = data || REVENUE_FALLBACK;
  if (loading) return <ChartSkeleton title="Revenue Per Visit" />;
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Revenue Per Visit</h4>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} />
          <YAxis tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} tickFormatter={v => `Rs.${Math.round(v/1000)}K`} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, fontSize: '13px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: ct.legendColor }} />
          <Bar dataKey="value" name="Revenue" fill="#8BC34A" radius={[4,4,0,0]} animationDuration={800} />
          <Line type="monotone" dataKey="value2" name="Trend" stroke={ct.isDark ? '#66BB6A' : '#1B5E20'} strokeWidth={2} dot={{ r: 3 }} animationDuration={800} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// src/sections/analytics/RecommendationAcceptanceChart.tsx
import { PieChart, Pie, Cell } from 'recharts';

interface AcceptanceItem { name: string; value: number; fill: string; }
interface AcceptanceProps { data?: AcceptanceItem[]; loading?: boolean; }

const ACCEPTANCE_FALLBACK: AcceptanceItem[] = [
  { name: 'Accepted', value: 87, fill: '#8BC34A' },
  { name: 'Pending',  value: 9,  fill: '#FFC107' },
  { name: 'Rejected', value: 4,  fill: '#E53935' },
];

export function RecommendationAcceptanceChart({ data, loading }: AcceptanceProps) {
  const ct = useChartTheme();
  const chartData = data || ACCEPTANCE_FALLBACK;
  const accepted = chartData.find(d => d.name === 'Accepted')?.value || 87;
  if (loading) return <ChartSkeleton title="Recommendation Acceptance" />;
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
        <span className="text-2xl font-extrabold text-lime-green">{accepted}%</span>
        <span className="text-xs text-text-muted ml-1">acceptance rate</span>
      </div>
      <div className="flex justify-center gap-4 mt-3">
        {chartData.map(entry => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
            <span className="text-[11px] text-text-muted">{entry.name}: {entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// src/sections/analytics/RegionalPerformanceChart.tsx
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface RegionalItem { metric: string; yourTerritory: number; average: number; }
interface RegionalProps { data?: RegionalItem[]; loading?: boolean; }

const REGIONAL_FALLBACK: RegionalItem[] = [
  { metric: 'Visits',      yourTerritory: 85, average: 65 },
  { metric: 'Revenue',     yourTerritory: 92, average: 70 },
  { metric: 'Acceptance',  yourTerritory: 87, average: 72 },
  { metric: 'Coverage',    yourTerritory: 78, average: 60 },
  { metric: 'Satisfaction',yourTerritory: 90, average: 75 },
];

export function RegionalPerformanceChart({ data, loading }: RegionalProps) {
  const ct = useChartTheme();
  const chartData = data || REGIONAL_FALLBACK;
  if (loading) return <ChartSkeleton title="Regional Performance" />;
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Regional Performance</h4>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke={ct.gridStroke} />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: ct.tickFill }} />
          <PolarRadiusAxis tick={{ fontSize: 9, fill: ct.tickFill }} domain={[0, 100]} />
          <Radar name="Your Territory" dataKey="yourTerritory" stroke={ct.isDark ? '#8BC34A' : '#1B5E20'} fill={ct.isDark ? '#8BC34A' : '#1B5E20'} fillOpacity={0.3} strokeWidth={2} animationDuration={800} />
          <Radar name="Average" dataKey="average" stroke={ct.tickFill} fill={ct.tickFill} fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" animationDuration={800} />
          <Legend wrapperStyle={{ fontSize: '11px', color: ct.legendColor }} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, fontSize: '13px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// src/sections/analytics/CropRiskTrendsChart.tsx
import { AreaChart, Area } from 'recharts';

interface CropRiskItem { month: string; rice: number; cotton: number; wheat: number; }
interface CropRiskProps { data?: CropRiskItem[]; loading?: boolean; }

const CROP_FALLBACK: CropRiskItem[] = [
  { month: 'Jan', rice: 12, cotton: 8,  wheat: 20 }, { month: 'Feb', rice: 18, cotton: 12, wheat: 15 },
  { month: 'Mar', rice: 15, cotton: 10, wheat: 12 }, { month: 'Apr', rice: 22, cotton: 15, wheat: 8  },
  { month: 'May', rice: 28, cotton: 20, wheat: 10 }, { month: 'Jun', rice: 35, cotton: 18, wheat: 12 },
  { month: 'Jul', rice: 42, cotton: 25, wheat: 9  },
];

export function CropRiskTrendsChart({ data, loading }: CropRiskProps) {
  const ct = useChartTheme();
  const chartData = data || CROP_FALLBACK;
  if (loading) return <ChartSkeleton title="Crop Risk Trends" />;
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Crop Risk Trends</h4>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} />
          <YAxis tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} tickFormatter={v => `${v}%`} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, fontSize: '13px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: ct.legendColor }} />
          <Area type="monotone" dataKey="rice" name="Rice" stackId="1" stroke="#8BC34A" fill="rgba(139,195,74,0.3)" animationDuration={800} />
          <Area type="monotone" dataKey="cotton" name="Cotton" stackId="1" stroke="#FFC107" fill="rgba(255,193,7,0.3)" animationDuration={800} />
          <Area type="monotone" dataKey="wheat" name="Wheat" stackId="1" stroke="#1E88E5" fill="rgba(30,136,229,0.3)" animationDuration={800} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// src/sections/analytics/StockUtilizationChart.tsx
import { BarChart as BChart, Cell as BCell } from 'recharts';

interface StockItem { product: string; utilization: number; stock: number; status: string; }
interface StockProps { data?: StockItem[]; loading?: boolean; }

const STATUS_COLORS: Record<string, string> = {
  optimal: '#8BC34A', low: '#FFC107', critical: '#E53935',
};

const STOCK_FALLBACK: StockItem[] = [
  { product: 'Amistar',   utilization: 85, stock: 22,  status: 'critical' },
  { product: 'Actara',    utilization: 45, stock: 180, status: 'optimal'  },
  { product: 'Score',     utilization: 72, stock: 56,  status: 'low'      },
  { product: 'Ridomil',   utilization: 68, stock: 34,  status: 'low'      },
  { product: 'Custodia',  utilization: 30, stock: 145, status: 'optimal'  },
  { product: 'Proclaim',  utilization: 55, stock: 92,  status: 'optimal'  },
];

export function StockUtilizationChart({ data, loading }: StockProps) {
  const ct = useChartTheme();
  const chartData = data || STOCK_FALLBACK;
  if (loading) return <ChartSkeleton title="Stock Utilization" />;
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">Stock Utilization</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} />
          <XAxis type="number" tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} tickFormatter={v => `${v}%`} />
          <YAxis dataKey="product" type="category" tick={{ fontSize: 11, fill: ct.tickFill }} axisLine={{ stroke: ct.axisStroke }} width={72} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: ct.tooltipBorder, backgroundColor: ct.tooltipBg, color: ct.tooltipColor, fontSize: '13px' }} />
          <Bar dataKey="utilization" name="Utilization %" radius={[0,4,4,0]} animationDuration={800}>
            {chartData.map((entry, i) => <BCell key={i} fill={STATUS_COLORS[entry.status] || '#8BC34A'} />)}
          </Bar>
        </BChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Shared skeleton component used by all charts ────────────────────────────
function ChartSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 animate-pulse">
      <div className="h-5 w-40 bg-light-gray dark:bg-white/10 rounded mb-4" />
      <div className="h-[250px] bg-light-gray dark:bg-white/10 rounded" />
    </div>
  );
}