import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, MapPin, TrendingUp, AlertTriangle, CheckCircle,
  ArrowUpRight, ArrowDownRight, RefreshCw, Send, ShieldAlert,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, Cell
} from 'recharts';
import { toast } from 'sonner';

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

// Mock Reps Data
const INITIAL_REPS = [
  { id: 'rep1', name: 'Amit Sharma', role: 'Field Representative', territory: 'Patna North', visits: 38, target: 40, revenue: 320000, acceptance: 92, efficiency: 88.5, status: 'active', lastActive: '10 mins ago', phone: '+91 98765 43210' },
  { id: 'rep2', name: 'Priya Tiwari', role: 'Field Representative', territory: 'Muzaffarpur South', visits: 29, target: 35, revenue: 245000, acceptance: 85, efficiency: 82.8, status: 'active', lastActive: '2 hrs ago', phone: '+91 87654 32109' },
  { id: 'rep3', name: 'Rajesh Verma', role: 'Field Representative', territory: 'Gaya West', visits: 31, target: 40, revenue: 260000, acceptance: 80, efficiency: 78.4, status: 'offline', lastActive: '1 day ago', phone: '+91 76543 21098' },
];

// Mock Revenue per Field Day Trend
const REVENUE_TREND = [
  { name: 'May 20', revenue: 42000, visits: 12 },
  { name: 'May 21', revenue: 58000, visits: 15 },
  { name: 'May 22', revenue: 49000, visits: 11 },
  { name: 'May 23', revenue: 65000, visits: 16 },
  { name: 'May 24', revenue: 72000, visits: 18 },
  { name: 'May 25', revenue: 81000, visits: 20 },
  { name: 'May 26', revenue: 60000, visits: 14 },
  { name: 'May 27', revenue: 89000, visits: 22 },
  { name: 'May 28', revenue: 95000, visits: 24 },
];

// Mock Product Demand Trends
const PRODUCT_DEMAND = [
  { product: 'Amistar (Fungicide)', sales: 420, stock: 22, growth: 18, color: COLORS.secondary },
  { product: 'Actara (Insecticide)', sales: 380, stock: 180, growth: -5, color: COLORS.blue },
  { product: 'Score (Fungicide)', sales: 290, stock: 56, growth: 12, color: COLORS.yellow },
  { product: 'Ridomil (Fungicide)', sales: 250, stock: 34, growth: 25, color: COLORS.red },
  { product: 'Custodia (Fungicide)', sales: 180, stock: 145, growth: 3, color: '#9C27B0' },
];

// Missed Opportunities
const MISSED_OPPORTUNITIES = [
  { id: 'mo1', retailer: 'Kisan Agro Kendra', area: 'Muzaffarpur North', priority: 'High', value: 45000, reason: 'High Pest Risk (BPH) alert unattended for 4 days' },
  { id: 'mo2', retailer: 'Mandi Fertilizers', area: 'Patna Rural', priority: 'Medium', value: 28000, reason: 'Amistar Stock Out reported, rep visit pending' },
  { id: 'mo3', retailer: 'Gaya Seeds Store', area: 'Gaya East', priority: 'High', value: 62000, reason: 'High digital engagement but no rep follow-up' },
];

export default function ManagerDashboard() {
  const [reps] = useState(INITIAL_REPS);
  const [timeRange, setTimeRange] = useState('14d');
  const [sendingAlert, setSendingAlert] = useState<string | null>(null);

  // Total Summary stats
  const totalRevenue = reps.reduce((acc, r) => acc + r.revenue, 0);
  const totalVisits = reps.reduce((acc, r) => acc + r.visits, 0);
  const totalTargets = reps.reduce((acc, r) => acc + r.target, 0);
  const avgAcceptance = Math.round(reps.reduce((acc, r) => acc + r.acceptance, 0) / reps.length);
  const avgEfficiency = Math.round(reps.reduce((acc, r) => acc + r.efficiency, 0) / reps.length);

  const handleSendNudge = (repId: string, repName: string) => {
    setSendingAlert(repId);
    setTimeout(() => {
      setSendingAlert(null);
      toast.success(`Nudge & visit recommendation sync sent successfully to ${repName}!`);
    }, 800);
  };

  const handleSyncData = () => {
    toast.success('Syncing regional telemetry & team visit metrics...');
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-10">
      {/* Upper Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3.5xl font-bold text-text-primary dark:text-white tracking-tight">
            Manager Analytics & Dashboard
          </h1>
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

          <button
            onClick={handleSyncData}
            className="p-2 rounded-button bg-light-gray dark:bg-white/5 border border-transparent dark:border-white/10 hover:bg-light-gray/80 dark:hover:bg-white/10 transition-colors text-text-primary dark:text-white"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => toast.success('CSV Report downloading...')}
            className="flex items-center gap-2 px-4 py-2 rounded-button bg-deep-green text-white text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-deep-green/20"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 4 Premium Glassmorphic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
        {/* Card 1: Total Revenue */}
        <motion.div
          whileHover={{ y: -4 }}
          className="relative overflow-hidden backdrop-blur-md bg-white/70 dark:bg-white/5 rounded-card p-5 border border-white/20 dark:border-white/10 shadow-card hover:shadow-card-hover transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-lime-green/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-lime-green" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-lime-green bg-lime-green/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              +14.2%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-text-secondary dark:text-white/50 text-xs font-semibold uppercase tracking-wider">Total Team Revenue</h3>
            <p className="text-2xl lg:text-2.5xl font-bold text-text-primary dark:text-white mt-1">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[11px] text-text-muted mt-1.5">94% of monthly target reached</p>
          </div>
          {/* Subtle graphic wave inside card */}
          <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND.slice(-4)}>
                <Area type="monotone" dataKey="revenue" stroke={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 2: Coverage Efficiency */}
        <motion.div
          whileHover={{ y: -4 }}
          className="relative overflow-hidden backdrop-blur-md bg-white/70 dark:bg-white/5 rounded-card p-5 border border-white/20 dark:border-white/10 shadow-card hover:shadow-card-hover transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-info-blue/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-info-blue" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-info-blue bg-info-blue/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              +5.4%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-text-secondary dark:text-white/50 text-xs font-semibold uppercase tracking-wider">Coverage Efficiency</h3>
            <p className="text-2xl lg:text-2.5xl font-bold text-text-primary dark:text-white mt-1">
              {avgEfficiency}%
            </p>
            <p className="text-[11px] text-text-muted mt-1.5">Avg of {reps.length} active field territories</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND.slice(-4)}>
                <Area type="monotone" dataKey="visits" stroke={COLORS.blue} fill={COLORS.blue} strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 3: Recommendation Acceptance Rate */}
        <motion.div
          whileHover={{ y: -4 }}
          className="relative overflow-hidden backdrop-blur-md bg-white/70 dark:bg-white/5 rounded-card p-5 border border-white/20 dark:border-white/10 shadow-card hover:shadow-card-hover transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-accent-yellow/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-yellow" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-danger-red bg-danger-red/10 px-2 py-0.5 rounded-full">
              <ArrowDownRight className="w-3 h-3" />
              -1.2%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-text-secondary dark:text-white/50 text-xs font-semibold uppercase tracking-wider">AI Rec Acceptance Rate</h3>
            <p className="text-2xl lg:text-2.5xl font-bold text-text-primary dark:text-white mt-1">
              {avgAcceptance}%
            </p>
            <p className="text-[11px] text-text-muted mt-1.5">Target: 85% acceptance baseline</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND.slice(-4)}>
                <Area type="monotone" dataKey="revenue" stroke={COLORS.yellow} fill={COLORS.yellow} strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Card 4: High Priority Visits */}
        <motion.div
          whileHover={{ y: -4 }}
          className="relative overflow-hidden backdrop-blur-md bg-white/70 dark:bg-white/5 rounded-card p-5 border border-white/20 dark:border-white/10 shadow-card hover:shadow-card-hover transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-danger-red/10 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-danger-red" />
            </div>
            <span className="text-xs font-semibold text-lime-green bg-lime-green/10 px-2 py-0.5 rounded-full">
              42/50
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-text-secondary dark:text-white/50 text-xs font-semibold uppercase tracking-wider">Critical Visits Done</h3>
            <p className="text-2xl lg:text-2.5xl font-bold text-text-primary dark:text-white mt-1">
              {totalVisits} <span className="text-sm font-normal text-text-muted">/ {totalTargets} Total</span>
            </p>
            <p className="text-[11px] text-text-muted mt-1.5">8 missed opportunities pending action</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND.slice(-4)}>
                <Area type="monotone" dataKey="visits" stroke={COLORS.red} fill={COLORS.red} strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Middle: Representative Performance Leaderboard */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 lg:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 gap-4 border-b border-light-gray dark:border-white/10">
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
              <tr className="border-b border-light-gray dark:border-white/5 text-text-muted text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Representative</th>
                <th className="py-3.5 px-4">Territory</th>
                <th className="py-3.5 px-4 text-center">Visits Completed</th>
                <th className="py-3.5 px-4 text-right">Revenue Generated</th>
                <th className="py-3.5 px-4 text-center">Acceptance Rate</th>
                <th className="py-3.5 px-4 text-center">Coverage Efficiency</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/40 dark:divide-white/5 text-sm">
              {reps.map((rep) => (
                <tr key={rep.id} className="hover:bg-light-gray/30 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-deep-green/10 dark:bg-lime-green/20 text-deep-green dark:text-lime-green font-bold flex items-center justify-center text-xs">
                        {rep.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary dark:text-white">{rep.name}</div>
                        <div className="text-[11px] text-text-muted">{rep.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-text-secondary dark:text-white/70 font-medium">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-lime-green" />
                      {rep.territory}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-semibold text-text-primary dark:text-white">
                        {rep.visits} / {rep.target}
                      </span>
                      {/* Bar indicator */}
                      <div className="w-16 h-1.5 bg-light-gray dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-lime-green"
                          style={{ width: `${(rep.visits / rep.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-text-primary dark:text-white">
                    {formatCurrency(rep.revenue)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      rep.acceptance >= 85 ? 'bg-lime-green/10 text-lime-green' : 'bg-accent-yellow/10 text-accent-yellow'
                    }`}>
                      {rep.acceptance}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-semibold text-text-primary dark:text-white">
                      {rep.efficiency}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${rep.status === 'active' ? 'bg-lime-green animate-pulse' : 'bg-text-muted'}`} />
                      <span className="text-[11px] text-text-secondary dark:text-white/60 font-semibold">{rep.lastActive}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleSendNudge(rep.id, rep.name)}
                      disabled={sendingAlert === rep.id}
                      className="inline-flex items-center gap-1 text-xs font-bold text-lime-green hover:text-lime-green/80 bg-lime-green/10 hover:bg-lime-green/20 px-3 py-1.5 rounded-button transition-all disabled:opacity-60"
                    >
                      <Send className="w-3 h-3" />
                      {sendingAlert === rep.id ? 'Nudging...' : 'Nudge'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Columns Grid: Charts and Risk Analyzer summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
        {/* Product Demand & Trends */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 lg:p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-text-primary dark:text-white">Product Demand Trends</h2>
                <p className="text-xs text-text-secondary dark:text-white/50 mt-0.5">Seasonal volume & stock indicator</p>
              </div>
              <span className="text-xs font-semibold text-lime-green bg-lime-green/10 px-2 py-0.5 rounded-full">Syngenta Master</span>
            </div>

            {/* Demand Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PRODUCT_DEMAND} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" stroke="rgba(255,255,255,0.1)" hide />
                  <YAxis dataKey="product" type="category" stroke="rgba(120,130,120,0.8)" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#142818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }}
                    formatter={(value) => [`${value} Bags`, 'Demand']}
                  />
                  <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
                    {PRODUCT_DEMAND.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-light-gray dark:border-white/5 grid grid-cols-2 gap-2 text-xs">
            {PRODUCT_DEMAND.map((pd, index) => (
              <div key={index} className="flex justify-between items-center px-3 py-1.5 rounded-lg bg-light-gray/40 dark:bg-white/5">
                <span className="text-text-secondary dark:text-white/60 truncate mr-2">{pd.product.split(' ')[0]}</span>
                <span className={`font-semibold flex items-center ${pd.growth > 0 ? 'text-lime-green' : 'text-danger-red'}`}>
                  {pd.growth > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {Math.abs(pd.growth)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue per Field Day Trend */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 lg:p-6 shadow-card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-text-primary dark:text-white">Revenue per Field Day</h2>
              <p className="text-xs text-text-secondary dark:text-white/50 mt-0.5">Visits completed vs cash generated</p>
            </div>
            <span className="text-xs font-semibold text-info-blue bg-info-blue/10 px-2.5 py-1 rounded-full">Daily Telemetry</span>
          </div>

          {/* Area Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND}>
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
      <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 lg:p-6 shadow-card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary dark:text-white">Missed Regional Opportunities</h2>
            <p className="text-xs text-text-secondary dark:text-white/50 mt-0.5">Critical AI alerts requiring direct manager intervention</p>
          </div>
          <span className="text-xs font-semibold text-danger-red bg-danger-red/10 px-2.5 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            8 Alerts Pending
          </span>
        </div>

        <div className="space-y-4">
          {MISSED_OPPORTUNITIES.map((opp) => (
            <div
              key={opp.id}
              className="p-4 rounded-xl border border-light-gray dark:border-white/5 bg-light-gray/20 dark:bg-white/5 hover:border-lime-green/30 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-danger-red/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5 text-danger-red" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary dark:text-white">{opp.retailer}</span>
                    <span className="text-[10px] font-semibold text-text-muted px-2 py-0.5 rounded-full bg-light-gray dark:bg-white/10">
                      {opp.area}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      opp.priority === 'High' ? 'bg-danger-red/10 text-danger-red' : 'bg-accent-yellow/10 text-accent-yellow'
                    }`}>
                      {opp.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary dark:text-white/60 mt-1.5 leading-relaxed">{opp.reason}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 self-stretch md:self-auto border-t md:border-t-0 border-light-gray dark:border-white/5 pt-3 md:pt-0">
                <div className="text-left md:text-right">
                  <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Est. Opportunity</div>
                  <div className="font-extrabold text-lime-green text-sm mt-0.5">{formatCurrency(opp.value)}</div>
                </div>

                <button
                  onClick={() => toast.success(`Assigned Muzaffarpur high priority opportunity alert to Amit Sharma!`)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-deep-green rounded-button hover:brightness-110 transition-all shadow-md shadow-deep-green/20"
                >
                  Assign to Rep
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
