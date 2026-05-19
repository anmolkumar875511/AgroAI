// src/pages/RecommendationsPage.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { recommendationsAPI } from '@/api/client';
import { ExplainableAICard } from '@/sections/recommendations/ExplainableAICard';
import { whyRecommendedText, riskTagsForRecommendation } from '@/lib/fieldOps';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const territory_id = user?.territory_id || 'TER_0001';

  const { data: recs, loading, refetch } = useApi(
    () => recommendationsAPI.getRecommendations(territory_id, 20),
    [territory_id],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#1976D2]">Field operations</p>
        <h2 className="text-2xl lg:text-3xl font-bold text-white mt-1">AI recommendations</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Explainable, confidence-ranked actions wired to live territory signals - not generic suggestions.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-[#1E293B] animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {(recs || []).map((rec) => (
            <ExplainableAICard
              key={rec.id}
              recommendation={{
                id: rec.id,
                priority: rec.priority,
                crop: rec.crop,
                cropIcon: 'Wheat',
                message: rec.message,
                weather: rec.weather,
                product: rec.product,
                village: rec.village,
                farmer: rec.farmer,
                pestRisk: rec.pest_risk,
                recommendedProduct: rec.product,
                nextAction: rec.next_action,
                followUpTimeline: rec.follow_up_timeline,
                explainableReasons: (rec.explainable_reasons || []).map((r) => ({
                  id: r.id,
                  title: r.title,
                  description: r.description,
                  icon: r.icon,
                })),
                visitPriorityScore: rec.visit_priority_score,
                whyRecommended: whyRecommendedText(rec),
                riskTagList: riskTagsForRecommendation(rec),
                retailerId: rec.retailer_id,
              }}
              onApply={() =>
                recommendationsAPI
                  .applyRecommendation({
                    recommendation_id: rec.id,
                    retailer_id: rec.retailer_id,
                    action: 'apply',
                  })
                  .then(refetch)
              }
              onDismiss={() =>
                recommendationsAPI
                  .applyRecommendation({
                    recommendation_id: rec.id,
                    retailer_id: rec.retailer_id,
                    action: 'dismiss',
                  })
                  .then(refetch)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
