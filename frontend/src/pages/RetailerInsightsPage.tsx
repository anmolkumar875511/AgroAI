import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, RefreshCw, MapPin, Clock, Package, TrendingUp, Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useRegion } from '@/contexts/RegionContext';
import { retailersAPI, visitPlannerAPI, type RetailerCard } from '@/api/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EmptyState } from '@/components/shared/EmptyState';

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
  const [planning, setPlanning] = useState(false);
  const [isPlanned, setIsPlanned] = useState(false);
  const navigate = useNavigate();

  const handleRescore = async () => {
    setRescoring(true);
    try {
      // Add minimum latency so the user sees the spin micro-animation
      await Promise.all([
        retailersAPI.rescore(retailer.retailer_id),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      toast.success(`ML priority score re-calculated for ${retailer.retailer_id}!`);
      onRescore(retailer.retailer_id);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to re-run ML score. Please try again.');
    } finally {
      setRescoring(false);
    }
  };

  const handlePlanVisit = async () => {
    setPlanning(true);
    try {
      await visitPlannerAPI.recordAction(
        { retailer_id: retailer.retailer_id, action: 'start' },
        retailer.territory_id
      );
      toast.success(`Retailer ${retailer.retailer_id} added to today's route!`, {
        action: {
          label: 'View Planner',
          onClick: () => navigate('/visit-planner'),
        },
      });
      setIsPlanned(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to plan visit. Please try again.');
    } finally {
      setPlanning(false);
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/80 dark:bg-[#121b14]/40 rounded-2xl shadow-md border border-white/30 dark:border-white/5 p-5 hover:shadow-lg hover:-translate-y-1 hover:border-white/50 dark:hover:border-white/10 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-text-primary dark:text-white truncate text-base">{retailer.retailer_id}</h3>
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border', PRIORITY_COLORS[retailer.priority_level] || PRIORITY_COLORS.Low)}>
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
          <div className="text-2xl font-black text-deep-green dark:text-lime-green">{retailer.visit_priority_score}</div>
          <div className="text-[9px] text-text-muted dark:text-white/40 uppercase tracking-widest font-extrabold">Score</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-light-gray/40 dark:bg-[#0b150c]/40 border border-light-gray/20 dark:border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Package className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted dark:text-white/40">Stock</span>
          </div>
          <div className="text-sm font-semibold text-text-primary dark:text-white">{retailer.total_stock_qty} units</div>
          <div className={cn('text-xs font-medium mt-0.5', STOCK_COLORS[retailer.stock_status] || 'text-text-muted')}>
            {retailer.stock_status}
          </div>
        </div>
        <div className="bg-light-gray/40 dark:bg-[#0b150c]/40 border border-light-gray/20 dark:border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted dark:text-white/40">Last Visit</span>
          </div>
          <div className="text-sm font-semibold text-text-primary dark:text-white">
            {retailer.last_visit_days > 0 ? `${retailer.last_visit_days}d ago` : 'Today'}
          </div>
          <div className="text-xs text-text-muted dark:text-white/50 mt-0.5">{retailer.last_visit_date || '—'}</div>
        </div>
      </div>

      {/* Recommended product */}
      {retailer.recommended_product && (
        <div className="mb-4 px-3 py-2 rounded-xl bg-lime-green/10 border border-lime-green/30">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-lime-green animate-pulse-slow" />
            <span className="text-xs font-bold text-lime-green uppercase tracking-wide">Recommended</span>
          </div>
          <p className="text-xs text-text-primary dark:text-white mt-0.5 font-bold">{retailer.recommended_product}</p>
        </div>
      )}

      {/* AI Explanation */}
      {retailer.explanation && (
        <p className="text-xs text-text-secondary dark:text-white/70 leading-relaxed mb-4 line-clamp-2">
          {retailer.explanation}
        </p>
      )}

      {/* Action */}
      <div className="flex gap-2">
        <button
          onClick={handlePlanVisit}
          disabled={planning || isPlanned || retailer.last_visit_days === 0}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1",
            isPlanned || retailer.last_visit_days === 0
              ? "bg-lime-green/20 text-lime-green border border-lime-green/30 cursor-not-allowed"
              : "gradient-primary text-white hover:brightness-110 shadow-glow-green hover:scale-[1.01]"
          )}
        >
          {planning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : retailer.last_visit_days === 0 ? (
            'Visited Today'
          ) : isPlanned ? (
            'In Today\'s Route'
          ) : (
            'Plan Visit'
          )}
        </button>
        <button
          onClick={handleRescore}
          disabled={rescoring}
          className="px-3.5 py-2.5 rounded-xl bg-light-gray/60 dark:bg-white/5 text-text-muted hover:text-text-primary dark:hover:text-white transition-all hover:scale-[1.02]"
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
  const { activeRegion } = useRegion();
  const territory_id = activeRegion.territoryId || user?.territory_id || 'TER_0001';
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const priority = searchParams.get('priority') || 'all';
  const stock = searchParams.get('stock') || 'all';
  
  // Local search state for debouncing
  const [localSearch, setLocalSearch] = useState(search);
  const [page, setPage]       = useState(0);
  const limit = 12;

  const updateParams = (newSearch: string, newPriority: string, newStock: string) => {
    const params: Record<string, string> = {};
    if (newSearch) params.search = newSearch;
    if (newPriority !== 'all') params.priority = newPriority;
    if (newStock !== 'all') params.stock = newStock;
    setSearchParams(params);
  };

  // Sync local search input with URL search param changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce typing inputs by 350ms before updating search queries
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        setPage(0);
        updateParams(localSearch, priority, stock);
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [localSearch, priority, stock, search]);

  const handlePriorityChange = (val: string) => {
    setPage(0);
    updateParams(localSearch, val, stock);
  };

  const handleStockChange = (val: string) => {
    setPage(0);
    updateParams(localSearch, priority, val);
  };

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
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex items-center gap-2.5 px-3.5 h-10 rounded-xl bg-white/80 dark:bg-[#121b14]/40 backdrop-blur-md border border-white/30 dark:border-white/5 flex-1 max-w-xs shadow-sm focus-within:border-deep-green dark:focus-within:border-lime-green transition-all duration-300">
          <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
          <input
            type="text" value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="Search retailer, tehsil, product..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary dark:text-white placeholder:text-text-muted/60"
          />
        </div>

        {/* Priority filter */}
        <select value={priority} onChange={e => handlePriorityChange(e.target.value)}
          className="h-10 px-3.5 rounded-xl bg-white/80 dark:bg-[#121b14]/40 backdrop-blur-md border border-white/30 dark:border-white/5 text-sm font-semibold text-text-primary dark:text-white outline-none cursor-pointer shadow-sm hover:scale-[1.01] transition-transform duration-300">
          <option value="all" className="bg-white dark:bg-[#142818] text-text-primary dark:text-white">All Priorities</option>
          <option value="High" className="bg-white dark:bg-[#142818] text-text-primary dark:text-white">High</option>
          <option value="Medium" className="bg-white dark:bg-[#142818] text-text-primary dark:text-white">Medium</option>
          <option value="Low" className="bg-white dark:bg-[#142818] text-text-primary dark:text-white">Low</option>
        </select>

        {/* Stock filter */}
        <select value={stock} onChange={e => handleStockChange(e.target.value)}
          className="h-10 px-3.5 rounded-xl bg-white/80 dark:bg-[#121b14]/40 backdrop-blur-md border border-white/30 dark:border-white/5 text-sm font-semibold text-text-primary dark:text-white outline-none cursor-pointer shadow-sm hover:scale-[1.01] transition-transform duration-300">
          <option value="all" className="bg-white dark:bg-[#142818] text-text-primary dark:text-white">All Stock</option>
          <option value="Low Stock" className="bg-white dark:bg-[#142818] text-text-primary dark:text-white">Low Stock</option>
          <option value="Out of Stock" className="bg-white dark:bg-[#142818] text-text-primary dark:text-white">Out of Stock</option>
          <option value="Good Stock" className="bg-white dark:bg-[#142818] text-text-primary dark:text-white">Good Stock</option>
        </select>

        {/* Summary badge */}
        <div className="h-10 px-4 flex items-center rounded-xl bg-deep-green/10 dark:bg-lime-green/10 text-deep-green dark:text-lime-green text-xs uppercase font-extrabold tracking-widest shadow-sm">
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
        <EmptyState
          icon={<TrendingUp className="w-8 h-8" />}
          title="No retailers found"
          description="Try adjusting search parameters or filters to find retailers in this territory."
        />
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
