import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MapPin, TrendingUp, AlertTriangle, CheckCircle,
  ArrowUpRight, ArrowDownRight, RefreshCw, Send, ShieldAlert,
  Download, Loader2
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, Cell
} from 'recharts';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import { managerAPI } from '@/api/client';
import { useRegion } from '@/contexts/RegionContext';

// Helper formatting function for Indian Rupees
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

// Premium colors matching our Tailwind system
const COLORS = {
  primary: '#1B5E20',   // deep-green
  secondary: '#8BC34A', // lime-green
  yellow: '#FFC107',    // accent-yellow
  blue: '#1E88E5',      // info-blue
  red: '#E53935',       // danger-red
  lightGray: '#EDF1E8',
};

// Empty fallback Data
const INITIAL_REPS: any[] = [];

// Empty Revenue per Field Day Trend
const REVENUE_TREND: any[] = [];

// Empty Product Demand Trends
const PRODUCT_DEMAND: any[] = [];

// Empty Missed Opportunities
const MISSED_OPPORTUNITIES: any[] = [];

export default function ManagerDashboard() {
  const [timeRange, setTimeRange] = useState('14d');
  const [sendingAlert, setSendingAlert] = useState<string | null>(null);
  const [assignedIds, setAssignedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { activeRegion } = useRegion();

  // Call the manager dashboard API endpoint dynamically
  const { data, loading, refetch } = useApi(
    () => managerAPI.getDashboard(activeRegion.id),
    [activeRegion.id]
  );

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-lime-green text-sm gap-2">
        <div className="w-8 h-8 border-2 border-lime-green border-t-transparent rounded-full animate-spin" />
        <span className="text-text-muted font-medium animate-pulse">Syncing team telemetry...</span>
      </div>
    );
  }

  // Safely fallback to local static data and filter by the active state/region
  const rawReps = data?.reps ?? INITIAL_REPS;
  const reps = rawReps
    .map(r => ({
      ...r,
      role: (r as any).role || 'Field Representative',
      lastActive: (r as any).last_active || (r as any).lastActive || 'active now'
    }))
    .filter(rep => {
      if (activeRegion.id === 'ind') return true;
      const stateName = activeRegion.name;
      return rep.territory.includes(stateName) || (stateName === 'Uttar Pradesh' && rep.territory.includes('UP'));
    });

  const rawMissed = (data?.missed_opportunities || MISSED_OPPORTUNITIES) as typeof MISSED_OPPORTUNITIES;
  const missedOpportunities = rawMissed.filter((mo: any) => {
    if (activeRegion.id === 'ind') return true;
    const stateName = activeRegion.name;
    return mo.state === stateName || (stateName === 'Uttar Pradesh' && mo.state === 'UP');
  });

  const totalRevenue = reps.reduce((acc, r) => acc + r.revenue, 0);
  const totalVisits = reps.reduce((acc, r) => acc + r.visits, 0);
  const totalTargets = reps.reduce((acc, r) => acc + r.target, 0);
  const avgAcceptance = reps.length ? Math.round(reps.reduce((acc, r) => acc + r.acceptance, 0) / reps.length) : 0;
  const avgEfficiency = reps.length ? Math.round(reps.reduce((acc, r) => acc + r.efficiency, 0) / reps.length) : 0;

  const revenueTrend = (data?.revenue_trend || REVENUE_TREND) as typeof REVENUE_TREND;
  const productDemand = (data?.product_demand || PRODUCT_DEMAND) as typeof PRODUCT_DEMAND;

  const visibleOpportunities = missedOpportunities.filter(opp => !assignedIds.includes(opp.id));

  const handleSendNudge = (repId: string, repName: string) => {
    setSendingAlert(repId);
    const promise = managerAPI.nudgeRep(repId);
    toast.promise(promise, {
      loading: `Sending visit nudge to ${repName}...`,
      success: `Nudge & visit recommendation sync sent successfully to ${repName}!`,
      error: `Failed to send nudge.`,
    });
    promise.finally(() => {
      setSendingAlert(null);
    });
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    const promise = refetch();
    toast.promise(promise, {
      loading: 'Syncing regional telemetry & team visit metrics...',
      success: 'Sync completed successfully!',
      error: (err) => `Sync failed: ${err.message || err}`,
    });
    try {
      await promise;
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportCSV = () => {
    if (!reps || reps.length === 0) {
      toast.error("No representative data available to export.");
      return;
    }
    setIsExporting(true);
    
    // Simulate compilation delay for premium UX feel
    setTimeout(() => {
      const headers = ['Representative', 'Territory', 'Visits Completed', 'Visit Target', 'Revenue Generated (INR)', 'Recommendation Acceptance (%)', 'Route Efficiency (%)', 'Status', 'Last Active'];
      const rows = reps.map(r => [
        `"${r.name}"`,
        `"${r.territory}"`,
        r.visits,
        r.target,
        r.revenue,
        `${r.acceptance}%`,
        `${r.efficiency}%`,
        `"${r.status}"`,
        `"${r.lastActive}"`
      ]);
      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `agroai_team_performance_${activeRegion.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
      toast.success(`Team performance data exported as CSV!`);
    }, 1000);
  };

  const handleAssignOpportunity = (oppId: string, area: string) => {
    setAssignedIds(prev => [...prev, oppId]);
    toast.success(`Assigned ${area} high priority opportunity alert to Amit Sharma!`);
  };

  return (
    <div className="space-y-5 lg:space-y-6 pb-6">
      {/* Upper Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl lg:text-3.5xl font-bold text-text-primary dark:text-white tracking-tight">
              Manager Analytics & Dashboard
            </h1>
            <span className="text-xs font-semibold text-lime-green bg-lime-green/10 px-2.5 py-1 rounded-full border border-lime-green/20">
              {activeRegion.name}
            </span>
          </div>
          <p className="text-text-secondary dark:text-white/60 text-sm mt-1">
            Monitor team visits, coverage efficiency, regional opportunities and demand trends.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 text-sm rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:ring-1 focus:ring-lime-green/30"
          >
            <option value="7d">Last 7 Days</option>
            <option value="14d">Last 14 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSyncData}
            disabled={isSyncing}
            className="p-2 rounded-button bg-light-gray dark:bg-white/5 border border-transparent dark:border-white/10 hover:bg-light-gray/80 dark:hover:bg-white/10 transition-colors text-text-primary dark:text-white disabled:opacity-60"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-button bg-deep-green text-white text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-deep-green/20 disabled:opacity-75"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </motion.button>
        </div>
      </div>

      {/* 4 Premium Glassmorphic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        {/* Card 1: Total Revenue */}
        <motion.div
          whileHover={{ y: -4 }}
          className="relative overflow-hidden backdrop-blur-md bg-white/70 dark:bg-white/5 rounded-card p-4 border border-white/20 dark:border-white/10 shadow-card hover:shadow-card-hover transition-colors duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="w-9.5 h-9.5 rounded-xl bg-lime-green/10 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-lime-green" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-lime-green bg-lime-green/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              0%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-text-secondary dark:text-white/50 text-[10px] font-semibold uppercase tracking-wider">Total Team Revenue</h3>
            <p className="text-2xl lg:text-2.2xl font-bold text-text-primary dark:text-white mt-1">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[11px] text-text-muted mt-1.5">0% of monthly target reached</p>
          </div>
          {/* Subtle graphic wave inside card */}
          <div className="absolute bottom-0 left-0 right-0 h-7 opacity-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend.slice(-4)}>
                <Area type="monotone" dataKey="revenue" stroke={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 2: Coverage Efficiency */}
        <motion.div
          whileHover={{ y: -4 }}
          className="relative overflow-hidden backdrop-blur-md bg-white/70 dark:bg-white/5 rounded-card p-4 border border-white/20 dark:border-white/10 shadow-card hover:shadow-card-hover transition-colors duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="w-9.5 h-9.5 rounded-xl bg-info-blue/10 flex items-center justify-center">
              <CheckCircle className="w-4.5 h-4.5 text-info-blue" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-info-blue bg-info-blue/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              0%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-text-secondary dark:text-white/50 text-[10px] font-semibold uppercase tracking-wider">Coverage Efficiency</h3>
            <p className="text-2xl lg:text-2.2xl font-bold text-text-primary dark:text-white mt-1">
              {avgEfficiency}%
            </p>
            <p className="text-[11px] text-text-muted mt-1.5">Avg of {reps.length} active field territories</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-7 opacity-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend.slice(-4)}>
                <Area type="monotone" dataKey="visits" stroke={COLORS.blue} fill={COLORS.blue} strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 3: Recommendation Acceptance Rate */}
        <motion.div
          whileHover={{ y: -4 }}
          className="relative overflow-hidden backdrop-blur-md bg-white/70 dark:bg-white/5 rounded-card p-4 border border-white/20 dark:border-white/10 shadow-card hover:shadow-card-hover transition-colors duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="w-9.5 h-9.5 rounded-xl bg-accent-yellow/10 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-accent-yellow" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-danger-red bg-danger-red/10 px-2 py-0.5 rounded-full">
              <ArrowDownRight className="w-3 h-3" />
              0%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-text-secondary dark:text-white/50 text-[10px] font-semibold uppercase tracking-wider">AI Rec Acceptance Rate</h3>
            <p className="text-2xl lg:text-2.2xl font-bold text-text-primary dark:text-white mt-1">
              {avgAcceptance}%
            </p>
            <p className="text-[11px] text-text-muted mt-1.5">Target: 85% acceptance baseline</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-7 opacity-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend.slice(-4)}>
                <Area type="monotone" dataKey="revenue" stroke={COLORS.yellow} fill={COLORS.yellow} strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 4: High Priority Visits */}
        <motion.div
          whileHover={{ y: -4 }}
          className="relative overflow-hidden backdrop-blur-md bg-white/70 dark:bg-white/5 rounded-card p-4 border border-white/20 dark:border-white/10 shadow-card hover:shadow-card-hover transition-colors duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="w-9.5 h-9.5 rounded-xl bg-danger-red/10 flex items-center justify-center">
              <ShieldAlert className="w-4.5 h-4.5 text-danger-red" />
            </div>
            <span className="text-xs font-semibold text-lime-green bg-lime-green/10 px-2 py-0.5 rounded-full">
              0/0
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-text-secondary dark:text-white/50 text-[10px] font-semibold uppercase tracking-wider">Critical Visits Done</h3>
            <p className="text-2xl lg:text-2.2xl font-bold text-text-primary dark:text-white mt-1">
              {totalVisits} <span className="text-sm font-normal text-text-muted">/ {totalTargets} Total</span>
            </p>
            <p className="text-[11px] text-text-muted mt-1.5">{visibleOpportunities.length} missed opportunities pending action</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-7 opacity-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend.slice(-4)}>
                <Area type="monotone" dataKey="visits" stroke={COLORS.red} fill={COLORS.red} strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Middle: Representative Performance Leaderboard */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-4 lg:p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4 border-b border-light-gray dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold text-text-primary dark:text-white">
              Representative Performance Tracker (Team Leaderboard)
            </h2>
            <p className="text-xs text-text-secondary dark:text-white/50 mt-0.5">
              Live field representative metrics, coverage, and territory allocations.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-semibold text-lime-green bg-lime-green/10 px-3 py-1 rounded-full">
            All Reps Online
          </span>
        </div>

        {/* Rep Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-light-gray dark:border-white/5 text-text-muted text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Representative</th>
                <th className="py-3 px-3">Territory</th>
                <th className="py-3 px-3 text-center">Visits Completed</th>
                <th className="py-3 px-3 text-right">Revenue Generated</th>
                <th className="py-3 px-3 text-center">Acceptance Rate</th>
                <th className="py-3 px-3 text-center">Coverage Efficiency</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/40 dark:divide-white/5 text-sm">
              {reps.map((rep) => (
                <tr key={rep.id} className="hover:bg-light-gray/30 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-deep-green/10 dark:bg-lime-green/20 text-deep-green dark:text-lime-green font-bold flex items-center justify-center text-xs">
                        {rep.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary dark:text-white text-xs lg:text-sm">{rep.name}</div>
                        <div className="text-[10px] text-text-muted">{rep.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-text-secondary dark:text-white/70 font-medium text-xs lg:text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-lime-green" />
                      {rep.territory}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-xs lg:text-sm">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-semibold text-text-primary dark:text-white">
                        {rep.visits} / {rep.target}
                      </span>
                      {/* Bar indicator */}
                      <div className="w-14 h-1 bg-light-gray dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-lime-green"
                          style={{ width: `${(rep.visits / rep.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-text-primary dark:text-white text-xs lg:text-sm">
                    {formatCurrency(rep.revenue)}
                  </td>
                  <td className="py-3 px-3 text-center text-xs lg:text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      rep.acceptance >= 85 ? 'bg-lime-green/10 text-lime-green' : 'bg-accent-yellow/10 text-accent-yellow'
                    }`}>
                      {rep.acceptance}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-xs lg:text-sm">
                    <span className="font-semibold text-text-primary dark:text-white">
                      {rep.efficiency}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-xs lg:text-sm">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${rep.status === 'active' ? 'bg-lime-green animate-pulse' : 'bg-text-muted'}`} />
                      <span className="text-[10px] text-text-secondary dark:text-white/60 font-semibold">{rep.lastActive}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSendNudge(rep.id, rep.name)}
                      disabled={sendingAlert === rep.id}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-lime-green hover:text-lime-green/80 bg-lime-green/10 hover:bg-lime-green/20 px-2.5 py-1 rounded-button transition-all disabled:opacity-60"
                    >
                      {sendingAlert === rep.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      <span>{sendingAlert === rep.id ? 'Nudging...' : 'Nudge'}</span>
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Columns Grid: Charts and Risk Analyzer summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Product Demand & Trends */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-4 lg:p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-text-primary dark:text-white">Product Demand Trends</h2>
                <p className="text-xs text-text-secondary dark:text-white/50 mt-0.5">Seasonal volume & stock indicator</p>
              </div>
              <span className="text-xs font-semibold text-lime-green bg-lime-green/10 px-2 py-0.5 rounded-full">Syngenta Master</span>
            </div>

            {/* Demand Chart */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productDemand} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" stroke="rgba(255,255,255,0.1)" hide />
                  <YAxis dataKey="product" type="category" stroke="rgba(120,130,120,0.8)" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#142818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }}
                    formatter={(value) => [`${value} Bags`, 'Demand']}
                    cursor={false}
                  />
                  <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
                    {productDemand.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={(entry as any).color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-light-gray dark:border-white/5 grid grid-cols-2 gap-2 text-xs">
            {productDemand.map((pd, index) => (
              <div key={index} className="flex justify-between items-center px-2.5 py-1.5 rounded-lg bg-light-gray/40 dark:bg-white/5">
                <span className="text-text-secondary dark:text-white/60 truncate mr-2">{(pd as any).product.split(' ')[0]}</span>
                <span className={`font-semibold flex items-center ${(pd as any).growth > 0 ? 'text-lime-green' : 'text-danger-red'}`}>
                  {(pd as any).growth > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {Math.abs((pd as any).growth)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue per Field Day Trend */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-4 lg:p-5 shadow-card">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary dark:text-white">Revenue per Field Day</h2>
              <p className="text-xs text-text-secondary dark:text-white/50 mt-0.5">Visits completed vs cash generated</p>
            </div>
            <span className="text-xs font-semibold text-info-blue bg-info-blue/10 px-2.5 py-1 rounded-full">Daily Telemetry</span>
          </div>

          {/* Area Chart */}
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 10 }} />
                <YAxis stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#142818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }}
                  formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area type="monotone" dataKey="revenue" name="Revenue generated" stroke={COLORS.secondary} fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Missed Opportunities & High Priority Risks */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-4 lg:p-5 shadow-card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary dark:text-white">Missed Regional Opportunities</h2>
            <p className="text-xs text-text-secondary dark:text-white/50 mt-0.5">Critical AI alerts requiring direct manager intervention</p>
          </div>          <span className="text-xs font-semibold text-danger-red bg-danger-red/10 px-2.5 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {visibleOpportunities.length} Alerts Pending
          </span>
        </div>

        <div className="space-y-3.5">
          <AnimatePresence initial={false}>
            {visibleOpportunities.map((opp) => (
              <motion.div
                key={(opp as any).id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="p-3.5 rounded-xl border border-light-gray dark:border-white/5 bg-light-gray/20 dark:bg-white/5 hover:border-lime-green/30 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-danger-red/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldAlert className="w-4.5 h-4.5 text-danger-red" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary dark:text-white text-xs lg:text-sm">{(opp as any).retailer}</span>
                      <span className="text-[9px] font-semibold text-text-muted px-2 py-0.5 rounded-full bg-light-gray dark:bg-white/10">
                        {(opp as any).area}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        (opp as any).priority === 'High' ? 'bg-danger-red/10 text-danger-red' : 'bg-accent-yellow/10 text-accent-yellow'
                      }`}>
                        {(opp as any).priority} Priority
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary dark:text-white/60 mt-1.5 leading-relaxed">{(opp as any).reason}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 self-stretch md:self-auto border-t md:border-t-0 border-light-gray dark:border-white/5 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <div className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Est. Opportunity</div>
                    <div className="font-extrabold text-lime-green text-sm mt-0.5">{formatCurrency((opp as any).value)}</div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAssignOpportunity((opp as any).id, (opp as any).retailer)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-deep-green rounded-button hover:brightness-110 transition-all shadow-md shadow-deep-green/20"
                  >
                    Assign to Rep
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
