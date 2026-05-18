/**
 * CHANGED FILE: src/sections/dashboard/MandiPriceCard.tsx
 *
 * What changed:
 * - Added optional `prices` prop — when provided (from DashboardPage API call),
 *   uses live data. Falls back to internal mandiAPI fetch if prop is absent.
 * - Removed hardcoded mandiPrices array
 * - Added loading skeleton
 */
import { TrendingUp, TrendingDown, Wheat, Sprout } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { mandiAPI, type MandiPrice } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Wheat, Sprout };

interface MandiPriceCardProps {
  prices?: MandiPrice[];  // injected from DashboardPage when available
}

export function MandiPriceCard({ prices: injectedPrices }: MandiPriceCardProps) {
  const { user } = useAuth();

  // Only fetch independently if DashboardPage didn't inject prices
  const { data: fetchedPrices, loading } = useApi(
    () => injectedPrices ? Promise.resolve(injectedPrices) : mandiAPI.getPrices(),
    [injectedPrices],
  );

  const prices = injectedPrices || fetchedPrices || [];

  if (loading && !prices.length) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 animate-pulse">
        <div className="h-5 w-40 bg-light-gray dark:bg-white/10 rounded mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="h-16 bg-light-gray dark:bg-white/10 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-text-primary dark:text-white">Today's Mandi Prices</h3>
        <span className="text-[11px] text-text-muted uppercase tracking-wider">Live · data.gov.in</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {prices.slice(0, 4).map((item) => {
          const Icon = iconMap[item.icon] || Sprout;
          return (
            <div key={item.crop} className="flex items-center gap-3 p-3 rounded-xl bg-light-gray/50 dark:bg-white/5 border border-transparent dark:border-white/5">
              <div className="w-10 h-10 rounded-xl bg-lime-green/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-lime-green" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary dark:text-white truncate">{item.crop}</p>
                <p className="text-[11px] text-text-muted truncate">{item.market}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text-primary dark:text-white">
                  {item.price}<span className="text-[10px] text-text-muted font-normal">{item.unit}</span>
                </p>
                <div className={`flex items-center gap-0.5 justify-end ${item.up ? 'text-lime-green' : 'text-danger-red'}`}>
                  {item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-[11px] font-medium">{item.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * CHANGED FILE: src/sections/dashboard/AIRecommendationsFeed.tsx
 *
 * What changed:
 * - Removed: import { aiRecommendations } from '@/data/mockData'
 * - Added: `territoryId` prop, fetches live from recommendationsAPI
 * - Recommendation shape from backend uses snake_case — mapped to component
 * - Added loading skeleton
 */
// (This component is re-exported here as a named export for clarity in the diff.
//  In your project, just update the existing file at the path shown.)
