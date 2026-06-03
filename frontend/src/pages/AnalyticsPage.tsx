import { useState } from 'react';
import { Download, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import { analyticsAPI } from '@/api/client';
import { FieldEfficiencyChart } from '@/sections/analytics/FieldEfficiencyChart';
import { RevenuePerVisitChart } from '@/sections/analytics/RevenuePerVisitChart';
import { RecommendationAcceptanceChart } from '@/sections/analytics/RecommendationAcceptanceChart';
import { RegionalPerformanceChart } from '@/sections/analytics/RegionalPerformanceChart';
import { CropRiskTrendsChart } from '@/sections/analytics/CropRiskTrendsChart';
import { StockUtilizationChart } from '@/sections/analytics/StockUtilizationChart';

import { useRegion } from '@/contexts/RegionContext';

const dateRanges = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 14 Days', value: '14d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('14d');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();
  const { activeRegion } = useRegion();
  const territory_id = activeRegion.territoryId || user?.territory_id || 'TER_0001';

  const { data, loading, error } = useApi(
    () => analyticsAPI.getAll(territory_id, dateRange),
    [territory_id, dateRange],
  );

  // Data transformation for charts
  const fieldEfficiencyData = data?.field_efficiency?.map(r => ({
    name: r.week,
    value: r.completed,
    value2: r.visits,
  }));

  const revenuePerVisitData = data?.revenue_per_visit?.map(r => ({
    name: r.month,
    value: r.revenue,
    value2: r.per_visit,
  }));

  const totalSent = data?.recommendation_acceptance?.reduce((acc, r) => acc + r.sent, 0) || 0;
  const totalAccepted = data?.recommendation_acceptance?.reduce((acc, r) => acc + r.accepted, 0) || 0;
  const totalRemaining = totalSent - totalAccepted;
  const totalPending = Math.round(totalRemaining * 0.6);
  const totalRejected = totalRemaining - totalPending;

  const acceptancePieData = totalSent > 0 ? [
    { name: 'Accepted', value: Math.round((totalAccepted / totalSent) * 100), fill: '#8BC34A' },
    { name: 'Pending',  value: Math.round((totalPending / totalSent) * 100), fill: '#FFC107' },
    { name: 'Rejected', value: Math.round((totalRejected / totalSent) * 100), fill: '#E53935' },
  ] : undefined;

  const regionalPerformanceData = data?.regional_performance?.map(r => ({
    metric: r.metric,
    yourTerritory: r.your_territory,
    average: r.average,
  }));

  const cropRiskTrendsData = data?.crop_risk_trends?.map(r => ({
    month: r.month,
    high: r.high,
    medium: r.medium,
    low: r.low,
  }));

  const stockUtilizationData = data?.stock_utilization?.map(s => {
    let statusMapped = 'optimal';
    if (s.status === 'Low Stock') statusMapped = 'low';
    if (s.status === 'Out of Stock') statusMapped = 'critical';
    return {
      product: s.product,
      utilization: s.utilization,
      stock: s.stock,
      status: statusMapped,
    };
  });

  const selectedLabel = dateRanges.find(d => d.value === dateRange)?.label ?? 'Last 14 Days';

  const exportToCSV = () => {
    if (!data) {
      toast.error("No analytics data available to export.");
      return;
    }
    setIsExporting(true);
    
    // Simulate compilation delay for premium UX feel
    setTimeout(() => {
      try {
        let csvContent = "";

        // 1. Regional Performance
        csvContent += "--- REGIONAL PERFORMANCE ---\n";
        csvContent += "Metric,Your Territory,Average\n";
        (data.regional_performance || []).forEach(r => {
          csvContent += `"${r.metric}",${r.your_territory},${r.average}\n`;
        });
        csvContent += "\n";

        // 2. Field Efficiency
        csvContent += "--- FIELD EFFICIENCY ---\n";
        csvContent += "Week,Completed Visits,Total Visits,Efficiency %\n";
        (data.field_efficiency || []).forEach(r => {
          csvContent += `"${r.week}",${r.completed},${r.visits},${r.efficiency}\n`;
        });
        csvContent += "\n";

        // 3. Revenue Per Visit
        csvContent += "--- REVENUE PER VISIT ---\n";
        csvContent += "Month,Total Revenue (₹),Total Visits,Revenue Per Visit (₹)\n";
        (data.revenue_per_visit || []).forEach(r => {
          csvContent += `"${r.month}",${r.revenue},${r.visits},${r.per_visit}\n`;
        });
        csvContent += "\n";

        // 4. Recommendation Acceptance
        csvContent += "--- RECOMMENDATION ACCEPTANCE ---\n";
        csvContent += "Month,Sent,Accepted,Acceptance Rate %\n";
        (data.recommendation_acceptance || []).forEach(r => {
          csvContent += `"${r.month}",${r.sent},${r.accepted},${r.rate}\n`;
        });
        csvContent += "\n";

        // 5. Crop Risk Trends
        csvContent += "--- CROP RISK TRENDS ---\n";
        csvContent += "Month,High Severity Risks,Medium Severity Risks,Low Severity Risks\n";
        (data.crop_risk_trends || []).forEach(r => {
          csvContent += `"${r.month}",${r.high},${r.medium},${r.low}\n`;
        });
        csvContent += "\n";

        // 6. Stock Utilization
        csvContent += "--- STOCK UTILIZATION ---\n";
        csvContent += "Product,Utilization %,Stock Units,Status\n";
        (data.stock_utilization || []).forEach(r => {
          csvContent += `"${r.product}",${r.utilization},${r.stock},"${r.status}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AgroAI_Territory_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Territory analytics CSV report downloaded successfully!");
      } catch (err: any) {
        toast.error("Failed to generate CSV: " + (err.message || err));
      } finally {
        setIsExporting(false);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-danger-red/10 border border-danger-red/20 rounded-lg text-danger-red text-sm">
          Failed to load analytics: {error}. Please verify backend connection.
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">
          Territory Analytics
        </h2>
        <div className="flex items-center gap-3">
          {/* Date picker */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 rounded-button bg-light-gray dark:bg-white/5 text-sm font-medium text-text-primary dark:text-white hover:bg-light-gray/80 dark:hover:bg-white/10 transition-colors"
            >
              <Calendar className="w-4 h-4 text-text-muted" />
              {selectedLabel}
            </button>
            {showDatePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                <div className="absolute right-0 top-11 w-44 bg-white dark:bg-[#1A1D18] border border-light-gray dark:border-white/10 rounded-lg shadow-dropdown z-50 overflow-hidden">
                  {dateRanges.map(range => (
                    <button
                      key={range.value}
                      onClick={() => { setDateRange(range.value); setShowDatePicker(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        dateRange === range.value
                          ? 'bg-lime-green/10 text-deep-green dark:text-lime-green font-semibold'
                          : 'text-text-primary dark:text-white hover:bg-light-gray/50 dark:hover:bg-white/5'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={exportToCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-button bg-deep-green text-white text-sm font-medium hover:bg-deep-green/90 transition-colors shadow-lg shadow-deep-green/20 disabled:opacity-85"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export CSV
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FieldEfficiencyChart data={fieldEfficiencyData} loading={loading} />
        <RevenuePerVisitChart data={revenuePerVisitData} loading={loading} />
        <RecommendationAcceptanceChart data={acceptancePieData} loading={loading} />
        <RegionalPerformanceChart data={regionalPerformanceData} loading={loading} />
        <CropRiskTrendsChart data={cropRiskTrendsData} loading={loading} />
        <StockUtilizationChart data={stockUtilizationData} loading={loading} />
      </div>
    </div>
  );
}
