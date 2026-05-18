// src/pages/VisitPlannerPage.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { visitPlannerAPI } from '@/api/client';
import { VisitPlannerHeader } from '@/sections/visit-planner/VisitPlannerHeader';
import { PriorityCard } from '@/sections/visit-planner/PriorityCard';
import { RouteVisualization } from '@/sections/visit-planner/RouteVisualization';

export default function VisitPlannerPage() {
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const territory_id = user?.territory_id || 'TER_0001';

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
                  tags: visit.tags as any,
                  aiReason: visit.ai_reason,
                  actions: visit.actions,
                }}
                retailerId={visit.retailer_id}
                territoryId={territory_id}
              />
            ))}
      </div>

      <RouteVisualization territoryId={territory_id} />
    </div>
  );
}