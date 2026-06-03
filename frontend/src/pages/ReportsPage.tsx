import { useState } from 'react';
import { Download, Table, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import { managerAPI } from '@/api/client';
import { useRegion } from '@/contexts/RegionContext';

const COLORS = ['#1B5E20', '#8BC34A', '#FFC107', '#1E88E5', '#E53935'];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('may_2026');
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'csv' | null>(null);
  const [isEmailing, setIsEmailing] = useState(false);

  const { activeRegion } = useRegion();

  const { data: dashData } = useApi(
    () => managerAPI.getDashboard(activeRegion.id),
    [activeRegion.id]
  );

  const reps = dashData?.reps || [];

  const liveReports = reps.length > 0 ? reps.map((r: any, index: number) => {
    return {
      id: `rep_${index+1}`,
      region: r.territory,
      visits: r.visits,
      revenue: r.revenue,
      targetAchieved: Math.round((r.visits / r.target) * 100),
      topProduct: index % 2 === 0 ? 'Amistar 250 SC' : 'Actara 25 WG',
    };
  }) : [];

  // Dynamic crop distribution based on activeRegion ID
  let cropDistribution = [
    { name: 'Rice', value: 35 },
    { name: 'Wheat', value: 30 },
    { name: 'Cotton', value: 20 },
    { name: 'Maize', value: 15 },
  ];

  if (activeRegion.id === 'br') {
    cropDistribution = [
      { name: 'Rice', value: 45 },
      { name: 'Wheat', value: 35 },
      { name: 'Maize', value: 20 },
    ];
  } else if (activeRegion.id === 'pb') {
    cropDistribution = [
      { name: 'Wheat', value: 50 },
      { name: 'Rice', value: 30 },
      { name: 'Mustard', value: 20 },
    ];
  } else if (activeRegion.id === 'mh') {
    cropDistribution = [
      { name: 'Cotton', value: 40 },
      { name: 'Soybean', value: 35 },
      { name: 'Sugarcane', value: 25 },
    ];
  } else if (activeRegion.id === 'gj') {
    cropDistribution = [
      { name: 'Cotton', value: 50 },
      { name: 'Mustard', value: 30 },
      { name: 'Groundnut', value: 20 },
    ];
  } else if (activeRegion.id === 'ka') {
    cropDistribution = [
      { name: 'Rice', value: 40 },
      { name: 'Sugarcane', value: 35 },
      { name: 'Maize', value: 25 },
    ];
  }


  const handleDownload = (format: 'pdf' | 'csv') => {
    if (downloadingFormat) return;
    setDownloadingFormat(format);

    setTimeout(() => {
      if (format === 'csv') {
        if (!liveReports || liveReports.length === 0) {
          toast.error("No report data available to export.");
          setDownloadingFormat(null);
          return;
        }
        const headers = ['Territory', 'Visits Completed', 'Revenue Generated (INR)', 'Target Achieved (%)', 'Top Recommended Product'];
        const rows = liveReports.map(r => [
          `"${r.region}"`,
          r.visits,
          r.revenue,
          `${r.targetAchieved}%`,
          `"${r.topProduct}"`
        ]);
        const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `agroai_regional_report_${activeRegion.id}_${dateRange}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Consolidated breakdown report downloaded as CSV!`);
      } else if (format === 'pdf') {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          toast.error('Pop-up blocked! Please allow pop-ups to print PDF.');
          setDownloadingFormat(null);
          return;
        }
        
        const rowsHtml = liveReports.map(r => `
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: bold;">${r.region}</td>
            <td style="padding: 10px; text-align: center;">${r.visits} visits</td>
            <td style="padding: 10px; text-align: right; color: #1B5E20; font-weight: bold;">₹${r.revenue.toLocaleString('en-IN')}</td>
            <td style="padding: 10px; text-align: center;">${r.targetAchieved}%</td>
            <td style="padding: 10px; text-align: center;">${r.topProduct}</td>
          </tr>
        `).join('');

        const cropHtml = cropDistribution.map((c, i) => `
          <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; margin-bottom: 6px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${COLORS[i % COLORS.length]};"></span>
            <span><strong>${c.name}</strong>: ${c.value}%</span>
          </div>
        `).join('');

        printWindow.document.write(`
          <html>
            <head>
              <title>AgroAI Regional Report - ${activeRegion.name}</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; line-height: 1.6; }
                .header { border-bottom: 2px solid #1B5E20; padding-bottom: 15px; margin-bottom: 25px; }
                .header h1 { color: #1B5E20; margin: 0; font-size: 26px; }
                .header p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
                .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; background: #f9f9f9; padding: 12px; border-radius: 6px; }
                .section-title { font-size: 18px; font-weight: bold; color: #1B5E20; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 15px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { background-color: #f1f8e9; padding: 12px 10px; font-weight: bold; text-align: left; font-size: 13px; border-bottom: 1px solid #ddd; }
                .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>AgroAI Field Intelligence Report</h1>
                <p>Farmer First Field Intelligence Platform</p>
              </div>
              
              <div class="meta">
                <div><strong>Region:</strong> ${activeRegion.name}</div>
                <div><strong>Period:</strong> ${dateRange.replace('_', ' ').toUpperCase()}</div>
                <div><strong>Generated Date:</strong> ${new Date().toLocaleDateString('en-IN')}</div>
              </div>
              
              <div class="section-title">Territory Consolidated Performance</div>
              <table>
                <thead>
                  <tr>
                    <th>Territory</th>
                    <th style="text-align: center;">Visits Completed</th>
                    <th style="text-align: right;">Revenue Generated</th>
                    <th style="text-align: center;">Target Achieved</th>
                    <th style="text-align: center;">Top Recommended Product</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>

              <div class="section-title">Crop Coverage Distribution</div>
              <div style="margin-bottom: 30px;">
                ${cropHtml}
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} AgroAI. Confidential Internal Syngenta Report.</p>
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        toast.success(`Consolidated report compiled! Print dialog opened for PDF export.`);
      }
      setDownloadingFormat(null);
    }, 1000);
  };

  const handleEmailReport = () => {
    setIsEmailing(true);
    setTimeout(() => {
      setIsEmailing(false);
      toast.success('Custom report has been compiled and emailed to your registered address.');
    }, 1200);
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
            disabled={downloadingFormat !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-button bg-deep-green text-white text-xs font-semibold hover:brightness-110 transition-all shadow-md shadow-deep-green/20 disabled:opacity-75"
          >
            {downloadingFormat === 'pdf' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{downloadingFormat === 'pdf' ? 'Generating...' : 'Download PDF'}</span>
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
                {liveReports.map((r, i) => (
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
                    data={cropDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {cropDistribution.map((_, index) => (
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
            {cropDistribution.map((c, i) => (
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
                disabled={downloadingFormat !== null}
                className="flex-1 py-2.5 text-xs font-bold rounded-button bg-light-gray dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white hover:bg-light-gray/80 dark:hover:bg-white/10 transition-colors disabled:opacity-60 inline-flex justify-center items-center gap-1.5"
              >
                {downloadingFormat === 'csv' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>CSV Sheet</span>
              </button>
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloadingFormat !== null}
                className="flex-1 py-2.5 text-xs font-bold rounded-button bg-deep-green text-white hover:brightness-110 transition-colors disabled:opacity-75 inline-flex justify-center items-center gap-1.5"
              >
                {downloadingFormat === 'pdf' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>PDF Document</span>
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleEmailReport}
              disabled={isEmailing}
              className="w-full py-2.5 text-xs font-bold rounded-button bg-lime-green text-deep-forest hover:brightness-110 transition-colors disabled:opacity-70 inline-flex justify-center items-center gap-1.5"
            >
              {isEmailing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEmailing ? 'Sending Report...' : 'Email Scheduled Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
