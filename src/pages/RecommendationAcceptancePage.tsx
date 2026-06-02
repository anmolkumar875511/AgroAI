import { useState } from 'react';
import { Sparkles, Filter, CheckCircle2, XCircle, ArrowUp, ArrowDown, Search } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useApi } from '@/hooks/useApi';
import { managerAPI } from '@/api/client';

const WEEKLY_TREND = [
  { week: 'Wk 1', rate: 65 },
  { week: 'Wk 2', rate: 68 },
  { week: 'Wk 3', rate: 70 },
  { week: 'Wk 4', rate: 72 },
  { week: 'Wk 5', rate: 71 },
  { week: 'Wk 6', rate: 74 },
  { week: 'Wk 7', rate: 76 },
  { week: 'Wk 8', rate: 73 },
];

const REP_ACCEPTANCE = [
  { id: 1, name: 'Amit Sharma', territory: 'Bihar', sent: 42, accepted: 35, rejected: 4, pending: 3, rate: 83, trend: 'up' },
  { id: 2, name: 'Priya Tiwari', territory: 'Maharashtra', sent: 38, accepted: 28, rejected: 6, pending: 4, rate: 74, trend: 'up' },
  { id: 3, name: 'Rajesh Verma', territory: 'Punjab', sent: 35, accepted: 22, rejected: 8, pending: 5, rate: 63, trend: 'down' },
  { id: 4, name: 'Suresh Kumar', territory: 'UP', sent: 20, accepted: 15, rejected: 3, pending: 2, rate: 75, trend: 'neutral' },
  { id: 5, name: 'Neha Singh', territory: 'Gujarat', sent: 21, accepted: 14, rejected: 4, pending: 3, rate: 67, trend: 'up' },
];

const PRODUCT_ACCEPTANCE = [
  { product: 'Amistar 250 SC', rate: 85 },
  { product: 'Actara 25 WG', rate: 78 },
  { product: 'Tilt 250 EC', rate: 72 },
  { product: 'Score 250 EC', rate: 68 },
  { product: 'Movondo', rate: 60 },
  { product: 'Vibrance Integral', rate: 55 },
];

const REJECTION_REASONS = [
  { name: 'Customer Not Interested', value: 35, color: '#E53935' },
  { name: 'Price Concerns', value: 25, color: '#FFC107' },
  { name: 'Already Using Competitor', value: 20, color: '#1E88E5' },
  { name: 'Product Not Available', value: 12, color: '#8BC34A' },
  { name: 'Other Reasons', value: 8, color: '#9C27B0' },
];

export default function RecommendationAcceptancePage() {
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRep, setSelectedRep] = useState('All');

  const { data: dashData } = useApi(
    () => managerAPI.getDashboard(),
    []
  );

  const reps = dashData?.reps || [];

  const liveRepAcceptance = reps.length > 0 ? reps.map((r: any, index: number) => {
    const sent = Math.round(r.visits * 1.3);
    const accepted = Math.round(sent * (r.acceptance / 100));
    const pending = Math.max(0, Math.round(sent * 0.08));
    const rejected = Math.max(0, sent - accepted - pending);
    return {
      id: index + 1,
      name: r.name,
      territory: r.territory.split(',')[1]?.trim() || r.territory.split(' ')[0] || 'Bihar',
      sent,
      accepted,
      rejected,
      pending,
      rate: Math.round(r.acceptance),
      trend: r.acceptance >= 80 ? 'up' : (r.acceptance < 70 ? 'down' : 'neutral'),
    };
  }) : REP_ACCEPTANCE;

  const totalSent = liveRepAcceptance.reduce((acc, r) => acc + r.sent, 0);
  const totalAccepted = liveRepAcceptance.reduce((acc, r) => acc + r.accepted, 0);
  const totalPendingRejected = totalSent - totalAccepted;
  const overallRate = totalSent > 0 ? Math.round((totalAccepted / totalSent) * 100) : 73;

  const filteredReps = liveRepAcceptance.filter(rep => {
    const matchesSearch = rep.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRepFilter = selectedRep === 'All' || rep.name === selectedRep;
    return matchesSearch && matchesRepFilter;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />;
      case 'down': return <ArrowDown className="w-3.5 h-3.5 text-rose-400" />;
      default: return <span className="text-text-muted px-1 font-bold">→</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white tracking-tight">
          AI Recommendation Impact
        </h1>
        <p className="text-text-secondary dark:text-white/60 text-sm mt-1">
          Measure overall grower & retailer acceptance rates of AI crop recommendations, fertilizers, and products.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 with circular-styled indicator */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Overall Acceptance Rate</p>
            <h3 className="text-2xl font-bold text-text-primary dark:text-white mt-1">{overallRate}%</h3>
            <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
              <ArrowUp className="w-3 h-3" /> +4.2% MoM growth
            </p>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center rounded-full border-[3.5px] border-white/10 border-t-lime-green">
            <span className="text-xs font-bold text-lime-green">{overallRate}%</span>
          </div>
        </div>

        {[
          { label: 'Recommendations Sent', value: String(totalSent), icon: Sparkles, desc: 'Targeting high-pest risk zones', color: 'text-blue-400 border-blue-500/20' },
          { label: 'Accepted Recommendations', value: String(totalAccepted), icon: CheckCircle2, desc: 'Converted to product sales', color: 'text-emerald-400 border-emerald-500/20' },
          { label: 'Pending / Rejected', value: String(totalPendingRejected), icon: XCircle, desc: 'Follow-ups recommended', color: 'text-rose-400 border-rose-500/20' },
        ].map((card, i) => (
          <div key={i} className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">{card.label}</p>
              <h3 className="text-2xl font-bold text-text-primary dark:text-white mt-1">{card.value}</h3>
              <p className="text-[10px] text-text-secondary dark:text-white/40 mt-0.5">{card.desc}</p>
            </div>
            <card.icon className={`w-8 h-8 ${card.color}`} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-4 shadow-card">
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-text-muted mr-1" />
          {['This Week', 'This Month', 'Quarter'].map((time) => (
            <button
              key={time}
              onClick={() => setTimeFilter(time)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                timeFilter === time
                  ? 'bg-deep-green text-white border-deep-green'
                  : 'border-light-gray dark:border-white/10 text-text-muted hover:bg-white/10'
              }`}
            >
              {time}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={selectedRep}
            onChange={(e) => setSelectedRep(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none"
          >
            <option value="All" className="bg-[#142818]">All Representatives</option>
            <option value="Amit Sharma" className="bg-[#142818]">Amit Sharma</option>
            <option value="Priya Tiwari" className="bg-[#142818]">Priya Tiwari</option>
            <option value="Rajesh Verma" className="bg-[#142818]">Rajesh Verma</option>
            <option value="Suresh Kumar" className="bg-[#142818]">Suresh Kumar</option>
            <option value="Neha Singh" className="bg-[#142818]">Neha Singh</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search sales conversions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-4 py-1.5 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:ring-1 focus:ring-lime-green/30"
            />
          </div>
        </div>
      </div>

      {/* Acceptance Area Trend Line */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card">
        <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
          Weekly AI Acceptance Rate Trends
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={WEEKLY_TREND} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAccept" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8BC34A" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8BC34A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#142818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }}
              />
              <Area type="monotone" dataKey="rate" stroke="#8BC34A" fillOpacity={1} fill="url(#colorAccept)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Rep Table vs Rejection Reasons & Product Acceptance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rep Table */}
        <div className="lg:col-span-2 backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card overflow-hidden">
          <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
            Representative-wise Acceptance Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-light-gray dark:border-white/10 text-text-muted font-semibold uppercase tracking-wider pb-3">
                  <th className="py-3 px-2">Representative</th>
                  <th className="py-3 px-2">State</th>
                  <th className="py-3 px-2 text-center">Sent</th>
                  <th className="py-3 px-2 text-center">Accepted</th>
                  <th className="py-3 px-2 text-center">Rejected</th>
                  <th className="py-3 px-2 text-center">Pending</th>
                  <th className="py-3 px-2 text-center">Success Rate</th>
                  <th className="py-3 px-2 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray dark:divide-white/5 text-text-primary dark:text-white/80">
                {filteredReps.map((rep) => (
                  <tr key={rep.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-2 font-semibold text-text-primary dark:text-white">{rep.name}</td>
                    <td className="py-4 px-2 text-text-secondary dark:text-white/60">{rep.territory}</td>
                    <td className="py-4 px-2 text-center">{rep.sent}</td>
                    <td className="py-4 px-2 text-center text-emerald-400 font-medium">{rep.accepted}</td>
                    <td className="py-4 px-2 text-center text-rose-400">{rep.rejected}</td>
                    <td className="py-4 px-2 text-center text-text-muted">{rep.pending}</td>
                    <td className="py-4 px-2">
                      <div className="flex flex-col gap-1 items-center max-w-[80px] mx-auto font-bold">
                        <span className="text-[10px] text-text-primary dark:text-white">{rep.rate}%</span>
                        <div className="w-full bg-light-gray dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-lime-green h-full rounded-full transition-all duration-300" style={{ width: `${rep.rate}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <span className="inline-flex justify-end w-full">{getTrendIcon(rep.trend)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rejection reasons */}
        <div className="space-y-6">
          {/* Rejection pie chart */}
          <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card">
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
              Top Reasons for Rejections
            </h2>
            <div className="h-60 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={REJECTION_REASONS}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {REJECTION_REASONS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#142818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Product-wise Acceptance rates */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card">
        <h2 className="text-lg font-bold text-text-primary dark:text-white mb-6">
          Recommendation Conversions by Product Brand
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PRODUCT_ACCEPTANCE} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="product" stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#142818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }}
              />
              <Bar dataKey="rate" fill="#8BC34A" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
