import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { visitPlannerAPI } from '@/api/client';
import { VisitPlannerHeader } from '@/sections/visit-planner/VisitPlannerHeader';
import { PriorityCard } from '@/sections/visit-planner/PriorityCard';
import { RouteVisualization } from '@/sections/visit-planner/RouteVisualization';
import { useRegion } from '@/contexts/RegionContext';
import { Calendar } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

const tagColorMap: Record<string, 'green' | 'blue' | 'red' | 'yellow'> = {
  'Fungicide': 'green',
  'High Stock': 'green',
  'Pest Alert': 'red',
  'Follow-up': 'blue',
  'New Season': 'blue',
  'Low Stock': 'yellow',
  'Top Revenue': 'green',
  'Critical': 'red',
  'NDVI Alert': 'yellow',
  'Visit Gap': 'blue',
};

function normalizeTags(tags: unknown[]) {
  return tags.map((tag) => {
    if (typeof tag === 'object' && tag !== null && 'label' in tag && 'color' in tag) {
      return tag as { label: string; color: 'green' | 'blue' | 'red' | 'yellow' };
    }
    const label = String(tag);
    return { label, color: tagColorMap[label] || 'green' };
  });
}

export default function VisitPlannerPage() {
  const [filter, setFilter] = useState('all');
  const [routeRefreshKey, setRouteRefreshKey] = useState(0);
  const { user } = useAuth();
  const { activeRegion } = useRegion();
  const territory_id = activeRegion.territoryId || user?.territory_id || 'TER_0001';

  const { data: visits, loading } = useApi(
    () => visitPlannerAPI.getPriorityVisits(territory_id, filter),
    [territory_id, filter],
  );

  return (
    <div className="space-y-6">
      <VisitPlannerHeader filter={filter} onFilterChange={setFilter} />

      <div className="space-y-4">
        {loading
          ? [0, 1, 2].map(i => (
              <div key={i} className="h-40 rounded-card bg-white dark:bg-white/5 animate-pulse border border-transparent dark:border-white/5" />
            ))
          : (!visits || visits.length === 0)
            ? (
                <EmptyState
                  icon={<Calendar className="w-8 h-8" />}
                  title="No priority visits planned"
                  description="There are no visits matching the selected filters in this territory."
                />
              )
            : (visits || []).map(visit => (
                <PriorityCard
                  key={visit.id}
                  visit={{
                    id: visit.id,
                    name: visit.name,
                    type: visit.type as any,
                    score: visit.score,
                    location: visit.location,
                    lastVisit: visit.last_visit,
                    status: visit.status,
                    tags: normalizeTags(visit.tags as unknown[]),
                    aiReason: visit.ai_reason,
                    actions: visit.actions,
                  }}
                  retailerId={visit.retailer_id}
                  territoryId={territory_id}
                  onRouteChanged={() => setRouteRefreshKey((key) => key + 1)}
                />
              ))}
      </div>

      <RouteVisualization territoryId={territory_id} refreshKey={routeRefreshKey} />
    </div>
  );
}
