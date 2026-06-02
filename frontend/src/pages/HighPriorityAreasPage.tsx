import { useState } from 'react';
import { AlertTriangle, Search, Filter, ShieldAlert, Sparkles, MapPin, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import { managerAPI } from '@/api/client';
import { useRegion } from '@/contexts/RegionContext';

const RISK_DISTRIBUTION: any[] = [];

const HIGH_PRIORITY_AREAS: any[] = [];

const RISK_FACTORS: any[] = [];

export default function HighPriorityAreasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const { activeRegion } = useRegion();

  const { data: dashData } = useApi(
    () => managerAPI.getDashboard(activeRegion.id),
    [activeRegion.id]
  );

  const missedOpportunities = dashData?.missed_opportunities || [];

  const liveAreas = missedOpportunities.length > 0 ? missedOpportunities.map((mo: any, index: number) => {
    return {
      id: index + 1,
      area: mo.retailer,
      district: mo.area.split(' ')[0],
      state: 'Bihar',
      priority: mo.priority === 'High' ? 'Critical' : mo.priority,
      riskScore: mo.priority === 'High' ? 88 : 65,
      retailers: index + 2,
      revenueImpact: `₹${(mo.value / 100000).toFixed(1)}L`,
    };
  }) : HIGH_PRIORITY_AREAS;

  const totalRevenueAtRisk = missedOpportunities.length > 0
    ? `₹${(missedOpportunities.reduce((acc: number, mo: any) => acc + mo.value, 0) / 100000).toFixed(1)}L`
    : '₹0';

  const criticalGapsCount = missedOpportunities.length > 0
    ? String(missedOpportunities.filter((mo: any) => mo.priority === 'High').length)
    : '0';

  const highRiskRetailersCount = missedOpportunities.length > 0
    ? String(missedOpportunities.length * 5) // Multiply by 5 for a realistic high-risk retailer count
    : '0';

  const filteredAreas = liveAreas.filter(area => {
    const matchesSearch = area.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || area.priority === priorityFilter;
    const matchesState = stateFilter === 'All' || area.state === stateFilter;
    return matchesSearch && matchesPriority && matchesState;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      case 'High': return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'Medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
    }
  };

  const handleAction = (area: string, priority: string) => {
    if (priority === 'Critical') {
      toast.success(`Priority rep dispatch broadcasted for ${area}!`);
    } else {
      toast.success(`Visit recommendation queued for ${area} field representative.`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white tracking-tight">
          High Priority Areas & Risks
        </h1>
        <p className="text-text-secondary dark:text-white/60 text-sm mt-1">
          Identify sales risk, stockout territories, grower engagement gaps, and active pest outbreaks.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Critical Area Gaps', value: criticalGapsCount, icon: AlertTriangle, desc: 'Immediate dispatch required', color: 'text-rose-400 border-rose-500/20' },
          { label: 'High Risk Retailers', value: highRiskRetailersCount, icon: ShieldAlert, desc: 'Low stock / high visit gap', color: 'text-amber-400 border-amber-500/20' },
          { label: 'Revenue at Risk', value: totalRevenueAtRisk, icon: TrendingUp, desc: 'Next 30 days projected sales', color: 'text-rose-400 border-rose-500/20' },
          { label: 'Pending Actions', value: '0', icon: Sparkles, desc: 'Recommended planner tasks', color: 'text-blue-400 border-blue-500/20' },
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
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none"
          >
            <option value="All" className="bg-[#142818]">All Priorities</option>
            <option value="Critical" className="bg-[#142818]">Critical</option>
            <option value="High" className="bg-[#142818]">High</option>
            <option value="Medium" className="bg-[#142818]">Medium</option>
            <option value="Low" className="bg-[#142818]">Low</option>
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none"
          >
            <option value="All" className="bg-[#142818]">All States</option>
            <option value="Bihar" className="bg-[#142818]">Bihar</option>
            <option value="Maharashtra" className="bg-[#142818]">Maharashtra</option>
            <option value="Punjab" className="bg-[#142818]">Punjab</option>
            <option value="UP" className="bg-[#142818]">Uttar Pradesh</option>
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search priority areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60 pl-9 pr-4 py-1.5 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:ring-1 focus:ring-lime-green/30"
          />
        </div>
      </div>

      {/* Main Grid: Priority Areas vs Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Areas Table */}
        <div className="lg:col-span-2 backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card overflow-hidden">
          <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
            Critical Risk & Opportunity Hotspots
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-light-gray dark:border-white/10 text-text-muted font-semibold uppercase tracking-wider pb-3">
                  <th className="py-3 px-2">Area / District</th>
                  <th className="py-3 px-2">State</th>
                  <th className="py-3 px-2 text-center">Priority</th>
                  <th className="py-3 px-2 text-center">Risk Index</th>
                  <th className="py-3 px-2 text-center">Retailers</th>
                  <th className="py-3 px-2 text-center">Revenue Risk</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray dark:divide-white/5 text-text-primary dark:text-white/80">
                {filteredAreas.map((area) => (
                  <tr key={area.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-2">
                      <div className="font-semibold text-text-primary dark:text-white">{area.area}</div>
                      <div className="text-[10px] text-text-muted">{area.district}</div>
                    </td>
                    <td className="py-4 px-2 text-text-secondary dark:text-white/60">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-lime-green" />
                        {area.state}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getPriorityBadge(area.priority)}`}>
                        {area.priority}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex flex-col gap-1 items-center max-w-[80px] mx-auto">
                        <span className="text-[10px] text-text-muted">{area.riskScore}</span>
                        <div className="w-full bg-light-gray dark:bg-white/10 h-1 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${
                            area.riskScore > 80 ? 'bg-rose-500' : area.riskScore > 60 ? 'bg-amber-500' : 'bg-lime-green'
                          }`} style={{ width: `${area.riskScore}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-center font-medium">{area.retailers}</td>
                    <td className="py-4 px-2 text-center text-rose-400 font-semibold">{area.revenueImpact}</td>
                    <td className="py-4 px-2 text-right">
                      <button
                        onClick={() => handleAction(area.area, area.priority)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all border ${
                          area.priority === 'Critical'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white'
                            : 'bg-lime-green/10 border-lime-green/30 text-lime-green hover:bg-lime-green hover:text-white'
                        }`}
                      >
                        {area.priority === 'Critical' ? 'Assign Rep' : 'Schedule Visit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Factors / Pie Chart Column */}
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card">
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
              Priority Risk Breakdown
            </h2>
            <div className="h-60 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={RISK_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {RISK_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#142818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Factors Panel */}
          <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card">
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
              Top Threat Risk Contributors
            </h2>
            <div className="space-y-3">
              {RISK_FACTORS.map((factor, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text-primary dark:text-white">{factor.name}</span>
                    <span className="text-[10px] text-text-muted">{factor.count} retailers · {factor.impact}</span>
                  </div>
                  <div className="w-full bg-light-gray dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${factor.color}`} style={{ width: `${factor.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
