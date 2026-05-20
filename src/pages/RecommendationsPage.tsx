import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { recommendationsAPI } from '@/api/client';
import { ExplainableAICard } from '@/sections/recommendations/ExplainableAICard';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const territory_id = user?.territory_id || 'TER_0001';

  const { data: recs, loading } = useApi(
    () => recommendationsAPI.getRecommendations(territory_id, 20),
    [territory_id],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">
          AI Recommendations
        </h2>
        <p className="mt-2 text-sm text-text-secondary dark:text-white/60">
          Explainable AI-powered recommendations with full transparency.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-card bg-white dark:bg-white/5 animate-pulse border border-transparent dark:border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {(recs || []).map(rec => (
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
                explainableReasons: (rec.explainable_reasons || []).map(r => ({
                  id: r.id, title: r.title, description: r.description, icon: r.icon,
                })),
                retailer_id: rec.retailer_id,
              }}
              onApply={() =>
                recommendationsAPI.applyRecommendation({
                  recommendation_id: rec.id,
                  retailer_id: rec.retailer_id,
                  action: 'apply',
                })
              }
              onDismiss={() =>
                recommendationsAPI.applyRecommendation({
                  recommendation_id: rec.id,
                  retailer_id: rec.retailer_id,
                  action: 'dismiss',
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
