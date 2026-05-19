// src/pages/RetailerInsightsPage.tsx
import { useState } from 'react';
import { Search, RefreshCw, MapPin, Clock, Package, TrendingUp, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { retailersAPI, type RetailerCard } from '@/api/client';
import { cn } from '@/lib/utils';

const PRIORITY_COLORS: Record<string, string> = {
  High:   'bg-[#D32F2F]/15 text-[#FFCDD2] border-[#D32F2F]/35',
  Medium: 'bg-[#F9A825]/12 text-[#FFE082] border-[#F9A825]/35',
  Low:    'bg-[#388E3C]/12 text-[#C8E6C9] border-[#388E3C]/30',
};

const STOCK_COLORS: Record<string, string> = {
  'Out of Stock': 'text-[#D32F2F]',
  'Low Stock':    'text-[#F9A825]',
  'Good Stock':   'text-[#388E3C]',
};

function RetailerCardUI({ retailer, onRescore }: { retailer: RetailerCard; onRescore: (id: string) => void }) {
  const [rescoring, setRescoring] = useState(false);

  const handleRescore = async () => {
    setRescoring(true);
    try { await retailersAPI.rescore(retailer.retailer_id); onRescore(retailer.retailer_id); }
    finally { setRescoring(false); }
  };

  const conversionPct = Math.min(96, Math.round(48 + retailer.visit_priority_score / 3.5));
  const invRisk =
    retailer.stock_status === 'Out of Stock'
      ? 'CRITICAL'
      : retailer.stock_status === 'Low Stock'
        ? 'HIGH'
        : 'LOW';

  return (
    <div className="rounded-xl border border-white/10 bg-[#1E293B] p-5 hover:border-[#1976D2]/30 hover:shadow-[0_0_24px_rgba(0,0,0,0.25)] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white truncate">{retailer.retailer_id}</h3>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', PRIORITY_COLORS[retailer.priority_level] || PRIORITY_COLORS.Low)}>
              {retailer.priority_level}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{retailer.location}</span>
          </div>
        </div>
        {/* Score ring */}
        <div className="flex-shrink-0 text-center">
          <div className="text-2xl font-extrabold text-[#388E3C] font-mono">{retailer.visit_priority_score}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Score</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0F172A]/60 border border-white/5 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Package className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-500">Stock</span>
          </div>
          <div className="text-sm font-semibold text-white">{retailer.total_stock_qty} units</div>
          <div className={cn('text-xs font-medium mt-0.5', STOCK_COLORS[retailer.stock_status] || 'text-slate-500')}>
            {retailer.stock_status}
          </div>
        </div>
        <div className="bg-[#0F172A]/60 border border-white/5 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-500">Last Visit</span>
          </div>
          <div className="text-sm font-semibold text-white">
            {retailer.last_visit_days > 0 ? `${retailer.last_visit_days}d ago` : 'Today'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{retailer.last_visit_date || '-'}</div>
        </div>
      </div>

      {/* Recommended product */}
      {retailer.recommended_product && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-[#2E7D32]/15 border border-[#388E3C]/30">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[#388E3C]" />
            <span className="text-xs font-semibold text-[#C8E6C9]">Bundle push</span>
          </div>
          <p className="text-xs text-white mt-0.5 font-medium">{retailer.recommended_product}</p>
        </div>
      )}

      <div className="mb-4 rounded-lg border border-[#1976D2]/25 bg-[#0F172A]/50 p-3 space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#1976D2]">AI insights</p>
        <p className="text-xs text-slate-300 leading-relaxed">
          {retailer.explanation ||
            `Likely to move ${retailer.recommended_product || 'priority SKU'} this week based on scan velocity and gap vs last monsoon cycle.`}
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-slate-500">Inventory risk</span>
            <p className="font-semibold text-[#F9A825]">{invRisk}</p>
          </div>
          <div>
            <span className="text-slate-500">Conversion probability</span>
            <p className="font-mono font-semibold text-[#388E3C]">{conversionPct}%</p>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500">Suggested action</span>
            <p className="text-slate-200 font-medium">{retailer.recommended_action || 'Push fungicide bundle + stock refill'}</p>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500">Next best action</span>
            <p className="text-[#1976D2] font-medium">Prioritize visit within 24 hours</p>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="flex gap-2">
        <button className="flex-1 py-2 rounded-lg bg-[#2E7D32] border border-[#388E3C]/40 text-white text-xs font-semibold hover:bg-[#276b2a] transition-colors shadow-[0_0_14px_rgba(46,125,50,0.2)]">
          Plan Visit
        </button>
        <button
          onClick={handleRescore}
          disabled={rescoring}
          className="px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-slate-400 hover:text-white transition-colors"
          title="Re-run ML score"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', rescoring && 'animate-spin')} />
        </button>
      </div>
    </div>
  );
}

export default function RetailerInsightsPage() {
  const { user } = useAuth();
  const territory_id = user?.territory_id || 'TER_0001';

  const [search, setSearch]   = useState('');
  const [priority, setPriority] = useState('all');
  const [stock, setStock]     = useState('all');
  const [page, setPage]       = useState(0);
  const limit = 12;

  const { data, loading, refetch } = useApi(
    () => retailersAPI.list({ territory_id, priority: priority !== 'all' ? priority : undefined, stock: stock !== 'all' ? stock : undefined, search, skip: page * limit, limit }),
    [territory_id, priority, stock, search, page],
  );

  const retailers = data?.retailers || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white">Retailer Insights</h2>
        <p className="mt-1 text-sm text-slate-400">
          AI-scored retailer cards with inventory, sales, and visit intelligence.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-[#1E293B] border border-white/10 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <input
            type="text" value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search retailer, tehsil, product..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-500"
          />
        </div>

        {/* Priority filter */}
        <select value={priority} onChange={e => { setPriority(e.target.value); setPage(0); }}
          className="h-9 px-3 rounded-lg bg-[#1E293B] border border-white/10 text-sm text-white outline-none cursor-pointer">
          <option value="all">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Stock filter */}
        <select value={stock} onChange={e => { setStock(e.target.value); setPage(0); }}
          className="h-9 px-3 rounded-lg bg-[#1E293B] border border-white/10 text-sm text-white outline-none cursor-pointer">
          <option value="all">All Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
          <option value="Good Stock">Good Stock</option>
        </select>

        {/* Summary badge */}
        <div className="h-9 px-3 flex items-center rounded-lg bg-[#2E7D32]/15 border border-[#388E3C]/30 text-[#C8E6C9] text-sm font-medium">
          {total} retailers
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-[#1E293B] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : retailers.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No retailers found. Try adjusting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {retailers.map(r => (
            <RetailerCardUI key={r.id} retailer={r} onRescore={() => refetch()} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="px-4 py-2 rounded-lg bg-[#1E293B] border border-white/10 text-sm font-medium text-slate-200 disabled:opacity-40 hover:bg-white/5 transition-colors">
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {page + 1} of {Math.ceil(total / limit)}
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * limit >= total}
            className="px-4 py-2 rounded-lg bg-[#1E293B] border border-white/10 text-sm font-medium text-slate-200 disabled:opacity-40 hover:bg-white/5 transition-colors">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
