/**
 * AI recommendations strip — enterprise command center styling.
 */
import { useState } from 'react';
import { ChevronRight, Leaf, Wheat, Flower2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { useApi } from '@/hooks/useApi';
import { recommendationsAPI } from '@/api/client';
import { ConfidenceScore } from '@/components/command-center/ConfidenceScore';
import { RiskTag } from '@/components/command-center/RiskTag';
import { WhyRecommendedBlock } from '@/components/command-center/WhyRecommendedBlock';
import { AIThinkingLoader } from '@/components/command-center/AIThinkingLoader';
import {
  recommendationConfidence,
  riskTagsForRecommendation,
  whyRecommendedBullets,
} from '@/lib/fieldOps';
import { cn } from '@/lib/utils';

const cropIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Rice: Wheat,
  Cotton: Flower2,
  Wheat: Wheat,
};

interface AIRecommendationsFeedProps {
  territoryId: string;
}

export function AIRecommendationsFeed({ territoryId }: AIRecommendationsFeedProps) {
  const navigate = useNavigate();
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const { data: recs, loading, refetch } = useApi(
    () => recommendationsAPI.getRecommendations(territoryId, 5),
    [territoryId],
  );

  const handleApply = async (
    e: React.MouseEvent,
    rec: { id: string; retailer_id: string },
  ) => {
    e.stopPropagation();
    setApplyingId(rec.id);
    try {
      await recommendationsAPI.applyRecommendation({
        recommendation_id: rec.id,
        retailer_id: rec.retailer_id,
        action: 'apply',
      });
      refetch();
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#1E293B] h-full flex flex-col min-h-[360px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0F172A]/50">
        <div>
          <h3 className="font-semibold text-white text-sm">AI field recommendations</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Ranked by model confidence & visit impact</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/recommendations')}
          className="px-2.5 py-1 rounded-md bg-[#2E7D32]/20 border border-[#388E3C]/40 text-[#C8E6C9] text-[11px] font-mono font-semibold hover:bg-[#2E7D32]/30 transition-colors"
        >
          {recs?.length ?? '...'} active
        </button>
      </div>

      <div className="p-3 space-y-2 flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 p-2">
            <AIThinkingLoader />
            {[0, 1].map((i) => (
              <div key={i} className="h-28 rounded-lg bg-[#0F172A]/60 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          (recs || []).map((rec) => {
            const CropIcon = cropIcons[rec.crop] || Leaf;
            const borderColor =
              rec.priority === 'high'
                ? 'border-l-[#D32F2F]'
                : rec.priority === 'medium'
                  ? 'border-l-[#F9A825]'
                  : 'border-l-[#388E3C]';
            const conf = recommendationConfidence(rec);
            const bullets = whyRecommendedBullets(rec);
            const tags = riskTagsForRecommendation(rec);
            const isApplying = applyingId === rec.id;

            return (
              <div
                key={rec.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate('/recommendations')}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/recommendations')}
                className={cn(
                  'w-full text-left flex flex-col gap-2 p-3 rounded-lg bg-[#0F172A]/50 border border-white/5 border-l-[3px] cursor-pointer',
                  borderColor,
                  'hover:border-white/15 hover:bg-[#0F172A]/80 transition-all group',
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5',
                      rec.priority === 'high'
                        ? 'bg-[#D32F2F] shadow-[0_0_8px_rgba(211,47,47,0.5)]'
                        : rec.priority === 'medium'
                          ? 'bg-[#F9A825]'
                          : 'bg-[#388E3C]',
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CropIcon className="w-3.5 h-3.5 text-[#388E3C]" />
                      <span className="text-sm font-semibold text-white">{rec.crop}</span>
                      <PriorityBadge priority={rec.priority} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">{rec.message}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#1976D2] flex-shrink-0 mt-1 transition-colors" />
                </div>

                <div className="pl-5 space-y-2">
                  <WhyRecommendedBlock bullets={bullets} title="Why this recommendation?" />

                  <div className="flex flex-wrap items-center gap-2 justify-between gap-y-2">
                    <div className="flex flex-wrap gap-1">
                      {tags.slice(0, 2).map((t) => (
                        <RiskTag
                          key={t}
                          label={t}
                          tone={
                            t.includes('HIGH') && t.includes('PEST')
                              ? 'danger'
                              : t.includes('INVENTORY')
                                ? 'warn'
                                : t.includes('CONVERSION') || t.includes('POTENTIAL')
                                  ? 'success'
                                  : 'info'
                          }
                        />
                      ))}
                    </div>
                    <ConfidenceScore pct={conf} />
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleApply(e, rec)}
                    disabled={isApplying}
                    className={cn(
                      'w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all border border-[#2E7D32]/50',
                      isApplying
                        ? 'bg-[#1E293B] text-slate-500 cursor-wait'
                        : 'bg-[#2E7D32] text-white hover:bg-[#276b2a] shadow-[0_0_14px_rgba(46,125,50,0.2)]',
                    )}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {isApplying ? 'Applying...' : 'Apply recommendation'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
