import { useState } from 'react';
import { Search, RefreshCw, MapPin, Clock, Package, TrendingUp, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { retailersAPI, type RetailerCard } from '@/api/client';
import { cn } from '@/lib/utils';

const PRIORITY_COLORS: Record<string, string> = {
  High:   'bg-danger-red/10 text-danger-red border-danger-red/20',
  Medium: 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20',
  Low:    'bg-lime-green/10 text-lime-green border-lime-green/20',
};

const STOCK_COLORS: Record<string, string> = {
  'Out of Stock': 'text-danger-red',
  'Low Stock':    'text-accent-yellow',
  'Good Stock':   'text-lime-green',
};

function RetailerCardUI({ retailer, onRescore }: { retailer: RetailerCard; onRescore: (id: string) => void }) {
  const [rescoring, setRescoring] = useState(false);

  const handleRescore = async () => {
    setRescoring(true);
    try { await retailersAPI.rescore(retailer.retailer_id); onRescore(retailer.retailer_id); }
    finally { setRescoring(false); }
  };

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-text-primary dark:text-white truncate">{retailer.retailer_id}</h3>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', PRIORITY_COLORS[retailer.priority_level] || PRIORITY_COLORS.Low)}>
              {retailer.priority_level}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{retailer.location}</span>
          </div>
        </div>
        {/* Score ring */}
        <div className="flex-shrink-0 text-center">
          <div className="text-2xl font-extrabold text-deep-green dark:text-lime-green">{retailer.visit_priority_score}</div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Score</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-off-white dark:bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Package className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs text-text-muted">Stock</span>
          </div>
          <div className="text-sm font-semibold text-text-primary dark:text-white">{retailer.total_stock_qty} units</div>
          <div className={cn('text-xs font-medium mt-0.5', STOCK_COLORS[retailer.stock_status] || 'text-text-muted')}>
            {retailer.stock_status}
          </div>
        </div>
        <div className="bg-off-white dark:bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs text-text-muted">Last Visit</span>
          </div>
          <div className="text-sm font-semibold text-text-primary dark:text-white">
            {retailer.last_visit_days > 0 ? `${retailer.last_visit_days}d ago` : 'Today'}
          </div>
          <div className="text-xs text-text-muted mt-0.5">{retailer.last_visit_date || '—'}</div>
        </div>
      </div>

      {/* Recommended product */}
      {retailer.recommended_product && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-lime-green/5 border border-lime-green/20">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-lime-green" />
            <span className="text-xs font-semibold text-lime-green">Recommended</span>
          </div>
          <p className="text-xs text-text-primary dark:text-white mt-0.5 font-medium">{retailer.recommended_product}</p>
        </div>
      )}

      {/* AI Explanation */}
      {retailer.explanation && (
        <p className="text-xs text-text-secondary dark:text-white/60 leading-relaxed mb-4 line-clamp-2">
          {retailer.explanation}
        </p>
      )}

      {/* Action */}
      <div className="flex gap-2">
        <button className="flex-1 py-2 rounded-button gradient-primary text-white text-xs font-semibold hover:brightness-110 transition-all">
          Plan Visit
        </button>
        <button
          onClick={handleRescore}
          disabled={rescoring}
          className="px-3 py-2 rounded-button bg-light-gray dark:bg-white/5 text-text-muted hover:text-text-primary dark:hover:text-white transition-colors"
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
        <h2 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">Retailer Insights</h2>
        <p className="mt-1 text-sm text-text-secondary dark:text-white/60">
          AI-scored retailer cards with inventory, sales, and visit intelligence.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 h-9 rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
          <input
            type="text" value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search retailer, tehsil, product..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary dark:text-white placeholder:text-text-muted"
          />
        </div>

        {/* Priority filter */}
        <select value={priority} onChange={e => { setPriority(e.target.value); setPage(0); }}
          className="h-9 px-3 rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-sm text-text-primary dark:text-white outline-none cursor-pointer">
          <option value="all">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Stock filter */}
        <select value={stock} onChange={e => { setStock(e.target.value); setPage(0); }}
          className="h-9 px-3 rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-sm text-text-primary dark:text-white outline-none cursor-pointer">
          <option value="all">All Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
          <option value="Good Stock">Good Stock</option>
        </select>

        {/* Summary badge */}
        <div className="h-9 px-3 flex items-center rounded-button bg-deep-green/10 text-deep-green dark:text-lime-green text-sm font-medium">
          {total} retailers
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-card bg-white dark:bg-white/5 animate-pulse border border-transparent dark:border-white/5" />
          ))}
        </div>
      ) : retailers.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
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
            className="px-4 py-2 rounded-button bg-light-gray dark:bg-white/5 text-sm font-medium text-text-primary dark:text-white disabled:opacity-40 hover:bg-light-gray/80 dark:hover:bg-white/10 transition-colors">
            ← Previous
          </button>
          <span className="text-sm text-text-muted">
            Page {page + 1} of {Math.ceil(total / limit)}
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * limit >= total}
            className="px-4 py-2 rounded-button bg-light-gray dark:bg-white/5 text-sm font-medium text-text-primary dark:text-white disabled:opacity-40 hover:bg-light-gray/80 dark:hover:bg-white/10 transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
