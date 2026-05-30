import { useState } from 'react';
import { Download, Table } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#1B5E20', '#8BC34A', '#FFC107', '#1E88E5', '#E53935'];

const REGION_REPORTS = [
  { id: 'rep_01', region: 'Patna Division', visits: 142, revenue: 1250000, targetAchieved: 95, topProduct: 'Amistar' },
  { id: 'rep_02', region: 'Muzaffarpur Div', visits: 110, revenue: 980000, targetAchieved: 88, topProduct: 'Actara' },
  { id: 'rep_03', region: 'Gaya Division', visits: 125, revenue: 1050000, targetAchieved: 92, topProduct: 'Score' },
];

const CROP_DISTRIBUTION = [
  { name: 'Rice', value: 45 },
  { name: 'Wheat', value: 25 },
  { name: 'Cotton', value: 15 },
  { name: 'Vegetables', value: 15 },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('may_2026');

  const handleDownload = (format: 'pdf' | 'csv') => {
    toast.success(`Generating customized regional report... Downloading as ${format.toUpperCase()}!`);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white tracking-tight">
            Regional Reports & Downloads
          </h1>
          <p className="text-text-secondary dark:text-white/60 text-sm mt-1">
            Generate territory performance sheets, crop risk indexes and export analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:ring-1 focus:ring-lime-green/30"
          >
            <option value="may_2026">May 2026</option>
            <option value="apr_2026">April 2026</option>
            <option value="q1_2026">Q1 2026</option>
          </select>

          <button
            onClick={() => handleDownload('pdf')}
            className="flex items-center gap-2 px-4 py-2 rounded-button bg-deep-green text-white text-xs font-semibold hover:brightness-110 transition-all shadow-md shadow-deep-green/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Reports Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consolidated Table */}
        <div className="lg:col-span-2 backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-text-primary dark:text-white">
              Territory Consolidated Breakdown
            </h2>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Table className="w-4 h-4 text-lime-green" /> Show All
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-light-gray dark:border-white/5 text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Territory</th>
                  <th className="py-3 px-2 text-center">Visits Completed</th>
                  <th className="py-3 px-2 text-right">Revenue Generated</th>
                  <th className="py-3 px-2 text-center">Target Achieved</th>
                  <th className="py-3 px-2 text-center">Top Recommended Product</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray/45 dark:divide-white/5 font-medium">
                {REGION_REPORTS.map((r, i) => (
                  <tr key={i} className="hover:bg-light-gray/25 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-2 font-bold text-text-primary dark:text-white">{r.region}</td>
                    <td className="py-3.5 px-2 text-center text-text-secondary dark:text-white/80">{r.visits} visits</td>
                    <td className="py-3.5 px-2 text-right text-lime-green font-bold">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(r.revenue)}
                    </td>
                    <td className="py-3.5 px-2 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-lime-green/10 text-lime-green font-bold">
                        {r.targetAchieved}% Achieved
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-center text-text-secondary dark:text-white/80">{r.topProduct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Crop Coverage Pie Chart */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
              Regional Crop Coverage
            </h2>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CROP_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {CROP_DISTRIBUTION.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#142818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Color Indicators list */}
          <div className="grid grid-cols-2 gap-2 text-[10px] mt-4 pt-3 border-t border-light-gray dark:border-white/5">
            {CROP_DISTRIBUTION.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-text-secondary dark:text-white/60">{c.name} ({c.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customized Reports Generator Tool */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card">
        <h2 className="text-lg font-bold text-text-primary dark:text-white mb-6">
          Custom Reports Generator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-bold text-text-muted">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:ring-1 focus:ring-lime-green/30"
            >
              <option value="summary">Consolidated Regional Summary</option>
              <option value="visits">Rep visits efficiency sheet</option>
              <option value="pest">Pest risk assessment reports</option>
              <option value="oos">Out-of-Stock (OOS) forecast sheet</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-bold text-text-muted">Territory Focus</label>
            <select className="w-full px-3 py-2.5 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:ring-1 focus:ring-lime-green/30">
              <option value="all">All Territories</option>
              <option value="north">Patna North</option>
              <option value="south">Muzaffarpur South</option>
              <option value="west">Gaya West</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-bold text-text-muted">Select Target Format</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload('csv')}
                className="flex-1 py-2.5 text-xs font-bold rounded-button bg-light-gray dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white hover:bg-light-gray/80 dark:hover:bg-white/10 transition-colors"
              >
                CSV Sheet
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                className="flex-1 py-2.5 text-xs font-bold rounded-button bg-deep-green text-white hover:brightness-110 transition-colors"
              >
                PDF Document
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => toast.success('Custom report has been compiled and emailed to your registered address.')}
              className="w-full py-2.5 text-xs font-bold rounded-button bg-lime-green text-deep-forest hover:brightness-110 transition-colors"
            >
              Email Scheduled Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
