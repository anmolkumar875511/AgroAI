import { ExplainableAICard } from '@/sections/recommendations/ExplainableAICard';
import { aiRecommendations } from '@/data/mockData';

export default function RecommendationsPage() {
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {aiRecommendations.map((rec) => (
          <ExplainableAICard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}
