// src/pages/GrowerInsightsPage.tsx
import { useState } from 'react';
import { Users, Leaf, AlertTriangle, BarChart3, Sprout, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { growersAPI, type GrowerCluster, type GrowerSummary } from '@/api/client';
import { cn } from '@/lib/utils';

const RISK_COLORS: Record<string, string> = {
  Critical: 'bg-[#D32F2F]/15 text-[#FFCDD2] border-[#D32F2F]/35',
  High:     'bg-[#F9A825]/12 text-[#FFE082] border-[#F9A825]/35',
  Medium:   'bg-[#1976D2]/12 text-[#BBDEFB] border-[#1976D2]/35',
  Low:      'bg-[#388E3C]/12 text-[#C8E6C9] border-[#388E3C]/30',
};

const RISK_DOT: Record<string, string> = {
  Critical: 'bg-[#D32F2F]',
  High: 'bg-[#F9A825]',
  Medium: 'bg-[#1976D2]',
  Low: 'bg-[#388E3C]',
};

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1E293B] p-5">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-extrabold text-white font-mono">{value}</div>
      <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function pestProbability(risk: string): number {
  if (risk === 'Critical') return 91;
  if (risk === 'High') return 74;
  if (risk === 'Medium') return 49;
  return 24;
}

function cropStageIndex(stage: string): number {
  const s = (stage || '').toLowerCase();
  if (s.includes('harvest') || s.includes('maturity')) return 3;
  if (s.includes('flower') || s.includes('reproductive') || s.includes('heading')) return 2;
  if (s.includes('tiller') || s.includes('vegetative') || s.includes('growth')) return 1;
  return 0;
}

function ClusterCard({ cluster }: { cluster: GrowerCluster }) {
  const stages = ['Sowing', 'Vegetative', 'Reproductive', 'Harvest prep'];
  const active = cropStageIndex(cluster.crop_stage);
  const pestPct = pestProbability(cluster.pest_risk);
  const prefLang = cluster.engagement_rate > 0.35 ? 'Hindi + English (digital)' : 'Hindi (voice-first)';

  return (
    <div className="rounded-xl border border-white/10 bg-[#1E293B] p-5 hover:border-[#1976D2]/25 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{cluster.tehsil}</h3>
          <p className="text-xs text-slate-500">
            {cluster.district}, {cluster.state}
          </p>
        </div>
        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0',
            RISK_COLORS[cluster.pest_risk] || RISK_COLORS.Low,
          )}
        >
          {cluster.pest_risk} risk
        </span>
      </div>

      <div className="mb-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2">Crop stage timeline</p>
        <div className="flex gap-1">
          {stages.map((st, i) => (
            <div
              key={st}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-colors',
                i <= active ? 'bg-[#388E3C] shadow-[0_0_8px_rgba(56,142,60,0.35)]' : 'bg-white/10',
              )}
              title={st}
            />
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">Current: {cluster.crop_stage}</p>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-[#2E7D32]/20 flex items-center justify-center border border-[#388E3C]/30">
          <Sprout className="w-3.5 h-3.5 text-[#388E3C]" />
        </div>
        <span className="text-sm text-white font-medium">{cluster.crop_type}</span>
        <span className="text-xs text-slate-500">- {cluster.crop_stage}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
        <div className="rounded-lg bg-[#0F172A]/60 border border-white/5 p-2">
          <span className="text-slate-500">Pest probability</span>
          <p className="text-lg font-mono font-bold text-[#F9A825]">{pestPct}%</p>
        </div>
        <div className="rounded-lg bg-[#0F172A]/60 border border-white/5 p-2">
          <span className="text-slate-500">AI urgency</span>
          <p className="text-lg font-mono font-bold text-[#D32F2F]">{cluster.urgency_score}</p>
        </div>
        <div className="col-span-2 rounded-lg bg-[#0F172A]/60 border border-white/5 p-2">
          <span className="text-slate-500">Weather impact</span>
          <p className="text-slate-300 leading-snug mt-0.5">
            Rainfall variance vs 5yr avg elevated for {cluster.district}; spray windows compressing.
          </p>
        </div>
        <div className="col-span-2 rounded-lg bg-[#0F172A]/60 border border-white/5 p-2">
          <span className="text-slate-500">Preferred language</span>
          <p className="text-slate-200 mt-0.5">{prefLang}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Growers', value: cluster.grower_count.toLocaleString() },
          { label: 'Scans', value: cluster.product_scans },
          { label: 'Engagement', value: `${(cluster.engagement_rate * 100).toFixed(0)}%` },
        ].map((s) => (
          <div key={s.label} className="bg-[#0F172A]/50 border border-white/5 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-white">{s.value}</div>
            <div className="text-[10px] text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-3 px-3 py-2 rounded-lg bg-[#0F172A]/60 border-l-[3px] border-[#388E3C]">
        <div className="flex items-start gap-2">
          <Leaf className="w-3.5 h-3.5 text-[#388E3C] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-semibold uppercase text-[#1976D2]">Recommended treatment</p>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{cluster.recommended_advisory}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Product focus</span>
        <span className="font-semibold text-[#388E3C]">{cluster.recommended_product}</span>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', RISK_DOT[cluster.pest_risk] || 'bg-[#388E3C]')} />
        <div className="flex-1 bg-white/10 rounded-full h-1.5">
          <div
            className="h-full rounded-full bg-[#2E7D32]"
            style={{ width: `${cluster.urgency_score}%` }}
          />
        </div>
        <span className="text-xs font-mono font-semibold text-white">{cluster.urgency_score}</span>
      </div>
    </div>
  );
}

export default function GrowerInsightsPage() {
  const { user } = useAuth();
  const territory_id = user?.territory_id || 'TER_0001';
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
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#1976D2]">Grower intelligence</p>
        <h2 className="text-2xl lg:text-3xl font-bold text-white mt-1">Grower insights</h2>
        <p className="mt-1 text-sm text-slate-400">
          Crop-level cluster intelligence - pest probability, stage timeline, weather impact, urgency.
        </p>
      </div>

      {/* Summary cards */}
      {s && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <SummaryCard icon={Users} label="Total Growers" value={s.total_growers.toLocaleString()} color="bg-[#2E7D32]" />
          <SummaryCard icon={BarChart3} label="Product Scans" value={s.total_product_scans.toLocaleString()} color="bg-[#1976D2]" />
          <SummaryCard icon={MessageSquare} label="Campaign Attended" value={s.campaign_attendance.toLocaleString()} color="bg-[#388E3C]" />
          <SummaryCard icon={Leaf} label="Avg Farm (acres)" value={s.avg_farm_size_acres.toFixed(1)} color="bg-[#2E7D32]/90" />
          <SummaryCard icon={BarChart3} label="Engagement Rate" value={`${(s.digital_engagement_rate * 100).toFixed(1)}%`} color="bg-[#F9A825]" />
          <SummaryCard icon={AlertTriangle} label="High Urgency" value={s.high_urgency_clusters} color="bg-[#D32F2F]" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="h-9 px-3 rounded-lg bg-[#1E293B] border border-white/10 text-sm text-white outline-none cursor-pointer"
        >
          <option value="all">All Crops</option>
          {['Rice', 'Wheat', 'Cotton', 'Maize', 'Mustard', 'Soybean', 'Sugarcane'].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="h-9 px-3 rounded-lg bg-[#1E293B] border border-white/10 text-sm text-white outline-none cursor-pointer"
        >
          <option value="all">All Urgency</option>
          {['Critical', 'High', 'Medium', 'Low'].map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <div className="h-9 px-3 flex items-center rounded-lg bg-[#2E7D32]/15 border border-[#388E3C]/30 text-[#C8E6C9] text-sm font-medium">
          {clusters.length} clusters
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 rounded-xl bg-[#1E293B] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : clusters.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
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
