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
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray dark:border-white/10">
        <h3 className="font-semibold text-text-primary dark:text-white">AI Recommendations</h3>
        <span
          onClick={() => navigate('/recommendations')}
          className="px-2.5 py-1 rounded-full gradient-primary text-white text-[11px] font-mono font-medium cursor-pointer hover:opacity-90 transition-opacity"
        >
          {recs?.length ?? '…'} New
        </span>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          [0,1,2].map(i => (
            <div key={i} className="h-20 rounded-lg bg-light-gray dark:bg-white/5 animate-pulse" />
          ))
        ) : (recs || []).map((rec) => {
          const CropIcon = cropIcons[rec.crop] || Leaf;
          const borderColor =
            rec.priority === 'high' ? 'border-l-danger-red' :
            rec.priority === 'medium' ? 'border-l-accent-yellow' : 'border-l-lime-green';

          return (
            <div
              key={rec.id}
              onClick={() => navigate('/recommendations')}
              className={`flex items-start gap-3 p-4 rounded-lg bg-off-white dark:bg-white/5 border-l-[3px] ${borderColor} hover:bg-light-gray/50 dark:hover:bg-white/10 transition-colors cursor-pointer group`}
            >
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${
                rec.priority === 'high' ? 'bg-danger-red' :
                rec.priority === 'medium' ? 'bg-accent-yellow' : 'bg-lime-green'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CropIcon className="w-3.5 h-3.5 text-lime-green" />
                  <span className="text-sm font-semibold text-text-primary dark:text-white">{rec.crop}</span>
                  <PriorityBadge priority={rec.priority} />
                </div>
                <p className="mt-1 text-sm text-text-secondary dark:text-white/70 line-clamp-2">{rec.message}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <span className="text-xs text-text-muted">Weather: {rec.weather}</span>
                  <span className="text-xs text-deep-green dark:text-lime-green font-medium">Product: {rec.product}</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-light-gray dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-deep-green/10 transition-colors">
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-deep-green transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
