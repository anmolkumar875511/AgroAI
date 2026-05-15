import { useState } from 'react';
import { VisitPlannerHeader } from '@/sections/visit-planner/VisitPlannerHeader';
import { PriorityCard } from '@/sections/visit-planner/PriorityCard';
import { RouteVisualization } from '@/sections/visit-planner/RouteVisualization';
import { priorityVisits } from '@/data/mockData';

export default function VisitPlannerPage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? priorityVisits
    : priorityVisits.filter((v) =>
        filter === 'high-risk'
          ? v.tags.some((t) => t.label.includes('Pest') || t.label.includes('Action'))
          : filter === 'revenue'
          ? v.tags.some((t) => t.label.includes('Revenue') || t.label.includes('Stock'))
          : filter === 'follow-up'
          ? v.tags.some((t) => t.label.includes('Follow'))
          : true
      );

  return (
    <div className="space-y-6">
      <VisitPlannerHeader filter={filter} onFilterChange={setFilter} />

      <div className="space-y-4">
        {filtered.map((visit) => (
          <PriorityCard key={visit.id} visit={visit} />
        ))}
      </div>

      <RouteVisualization />
    </div>
  );
}
