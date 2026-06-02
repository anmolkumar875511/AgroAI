import { ChevronRight, Leaf, Wheat, Flower2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { useApi } from '@/hooks/useApi';
import { recommendationsAPI } from '@/api/client';

const cropIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Rice: Wheat, Cotton: Flower2, Wheat: Wheat,
};

interface AIRecommendationsFeedProps {
  territoryId: string;   // NEW prop — was using mock data before
}

export function AIRecommendationsFeed({ territoryId }: AIRecommendationsFeedProps) {
  const navigate = useNavigate();

  const { data: recs, loading } = useApi(
    () => recommendationsAPI.getRecommendations(territoryId, 5),
    [territoryId],
  );

  return (
    <div className="backdrop-blur-md bg-white/80 dark:bg-[#121b14]/40 rounded-2xl shadow-md border border-white/30 dark:border-white/5 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-light-gray dark:border-white/5">
        <h3 className="font-semibold text-text-primary dark:text-white text-sm">AI Recommendations</h3>
        <span
          onClick={() => navigate('/recommendations')}
          className="px-2.5 py-1 rounded-full gradient-primary text-white text-[9px] font-bold uppercase tracking-wider cursor-pointer hover:scale-105 transition-all shadow-glow-green"
        >
          {recs?.length ?? '0'} New
        </span>
      </div>

      <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
        {loading ? (
          [0, 1, 2].map(i => (
            <div key={i} className="h-20 rounded-xl bg-light-gray/60 dark:bg-white/5 animate-pulse" />
          ))
        ) : (recs || []).map((rec) => {
          const CropIcon = cropIcons[rec.crop] || Leaf;
          const priority = rec.priority?.toLowerCase();
          const leftLineColor =
            priority === 'critical' || priority === 'high' ? 'bg-danger-red' :
            priority === 'medium' ? 'bg-accent-yellow' : 'bg-lime-green';

          return (
            <div
              key={rec.id}
              onClick={() => navigate('/recommendations')}
              className="flex items-start gap-3 p-3 rounded-xl bg-off-white/80 dark:bg-white/5 border border-transparent dark:border-white/5 hover:border-deep-green/10 dark:hover:border-lime-green/10 hover:shadow-sm hover:translate-x-1.5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              {/* Left indicator line bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${leftLineColor}`} />

              <div className="flex-1 min-w-0 pl-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-deep-green/5 dark:bg-lime-green/5 px-2 py-0.5 rounded-md">
                    <CropIcon className="w-3.5 h-3.5 text-deep-green dark:text-lime-green animate-pulse-slow" />
                    <span className="text-[11px] font-bold text-deep-green dark:text-lime-green">{rec.crop}</span>
                  </div>
                  <PriorityBadge priority={rec.priority} />
                </div>
                <p className="mt-1.5 text-[13px] font-medium text-text-secondary dark:text-white/80 leading-relaxed line-clamp-2">{rec.message}</p>
                <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1.5 border-t border-light-gray/50 dark:border-white/5 pt-2">
                  <span className="text-[10px] text-text-muted dark:text-white/40 font-medium">Weather: {rec.weather}</span>
                  <span className="text-[10px] text-deep-green dark:text-lime-green font-semibold">Product: {rec.product}</span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-light-gray/50 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-deep-green/10 dark:group-hover:bg-lime-green/10 transition-all duration-300">
                <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-deep-green dark:group-hover:text-lime-green transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
