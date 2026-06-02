import { useState } from 'react';
import { Users, Leaf, AlertTriangle, BarChart3, Sprout, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useRegion } from '@/contexts/RegionContext';
import { growersAPI, type GrowerCluster, type GrowerSummary } from '@/api/client';
import { cn } from '@/lib/utils';

const RISK_COLORS: Record<string, string> = {
  Critical: 'bg-danger-red/10 text-danger-red border-danger-red/20',
  High:     'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20',
  Medium:   'bg-info-blue/10 text-info-blue border-info-blue/20',
  Low:      'bg-lime-green/10 text-lime-green border-lime-green/20',
};

const RISK_DOT: Record<string, string> = {
  Critical: 'bg-danger-red', High: 'bg-accent-yellow',
  Medium: 'bg-info-blue', Low: 'bg-lime-green',
};

function SummaryCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white dark:bg-white/5 rounded-card p-5 shadow-card border border-transparent dark:border-white/5">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-extrabold text-text-primary dark:text-white">{value}</div>
      <div className="text-xs text-text-muted uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function ClusterCard({ cluster }: { cluster: GrowerCluster }) {
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-text-primary dark:text-white">{cluster.tehsil}</h3>
          <p className="text-xs text-text-muted">{cluster.district}, {cluster.state}</p>
        </div>
        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0', RISK_COLORS[cluster.pest_risk] || RISK_COLORS.Low)}>
          {cluster.pest_risk} Risk
        </span>
      </div>

      {/* Crop info */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-lime-green/10 flex items-center justify-center">
          <Sprout className="w-3.5 h-3.5 text-lime-green" />
        </div>
        <span className="text-sm text-text-primary dark:text-white font-medium">{cluster.crop_type}</span>
        <span className="text-xs text-text-muted">· {cluster.crop_stage}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Growers', value: cluster.grower_count.toLocaleString() },
          { label: 'Scans', value: cluster.product_scans },
          { label: 'Engagement', value: `${(cluster.engagement_rate * 100).toFixed(0)}%` },
        ].map(s => (
          <div key={s.label} className="bg-off-white dark:bg-white/5 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-text-primary dark:text-white">{s.value}</div>
            <div className="text-[10px] text-text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Advisory */}
      <div className="mb-4 px-3 py-2 rounded-lg bg-off-white dark:bg-white/5 border-l-[3px] border-lime-green">
        <div className="flex items-start gap-2">
          <Leaf className="w-3.5 h-3.5 text-lime-green flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary dark:text-white/70 leading-relaxed">{cluster.recommended_advisory}</p>
        </div>
      </div>

      {/* Recommended product */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">Recommended:</span>
        <span className="text-xs font-semibold text-deep-green dark:text-lime-green">{cluster.recommended_product}</span>
      </div>

      {/* Urgency score */}
      <div className="mt-3 pt-3 border-t border-light-gray dark:border-white/10 flex items-center gap-2">
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', RISK_DOT[cluster.pest_risk] || 'bg-lime-green')} />
        <div className="flex-1 bg-light-gray dark:bg-white/10 rounded-full h-1.5">
          <div className="h-full rounded-full bg-gradient-to-r from-lime-green to-deep-green" style={{ width: `${cluster.urgency_score}%` }} />
        </div>
        <span className="text-xs font-mono font-semibold text-text-primary dark:text-white">{cluster.urgency_score}</span>
      </div>
    </div>
  );
}

export default function GrowerInsightsPage() {
  const { user } = useAuth();
  const { activeRegion } = useRegion();
  const territory_id = activeRegion.territoryId || user?.territory_id || 'TER_0001';
  const [crop, setCrop]     = useState('all');
  const [urgency, setUrgency] = useState('all');

  const { data: summary } = useApi(
    () => growersAPI.getSummary(territory_id),
    [territory_id],
  );

  const { data: clustersData, loading } = useApi(
    () => growersAPI.getClusters({ territory_id, crop: crop !== 'all' ? crop : undefined, urgency: urgency !== 'all' ? urgency : undefined }),
    [territory_id, crop, urgency],
  );

  const clusters = clustersData?.clusters || [];

  const s = summary as GrowerSummary | null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">Grower Insights</h2>
        <p className="mt-1 text-sm text-text-secondary dark:text-white/60">
          Crop-level farmer cluster intelligence — pest risk, crop stage, advisory, engagement.
        </p>
      </div>

      {/* Summary cards */}
      {s && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <SummaryCard icon={Users}         label="Total Growers"    value={s.total_growers.toLocaleString()} color="bg-deep-green" />
          <SummaryCard icon={BarChart3}     label="Product Scans"    value={s.total_product_scans.toLocaleString()} color="bg-info-blue" />
          <SummaryCard icon={MessageSquare} label="Campaign Attended" value={s.campaign_attendance.toLocaleString()} color="bg-lime-green/80" />
          <SummaryCard icon={Leaf}          label="Avg Farm (acres)"  value={s.avg_farm_size_acres.toFixed(1)} color="bg-deep-green/70" />
          <SummaryCard icon={BarChart3}     label="Engagement Rate"   value={`${(s.digital_engagement_rate * 100).toFixed(1)}%`} color="bg-accent-yellow/80" />
          <SummaryCard icon={AlertTriangle} label="High Urgency"       value={s.high_urgency_clusters} color="bg-danger-red" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={crop} onChange={e => setCrop(e.target.value)}
          className="h-9 px-3 rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-sm text-text-primary dark:text-white outline-none cursor-pointer">
          <option value="all">All Crops</option>
          {['Rice','Wheat','Cotton','Maize','Mustard','Soybean','Sugarcane'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={urgency} onChange={e => setUrgency(e.target.value)}
          className="h-9 px-3 rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-sm text-text-primary dark:text-white outline-none cursor-pointer">
          <option value="all">All Urgency</option>
          {['Critical','High','Medium','Low'].map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <div className="h-9 px-3 flex items-center rounded-button bg-deep-green/10 text-deep-green dark:text-lime-green text-sm font-medium">
          {clusters.length} clusters
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 rounded-card bg-white dark:bg-white/5 animate-pulse border border-transparent dark:border-white/5" />
          ))}
        </div>
      ) : clusters.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Sprout className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No clusters found. Try adjusting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clusters.map(c => <ClusterCard key={c.id} cluster={c} />)}
        </div>
      )}
    </div>
  );
}
