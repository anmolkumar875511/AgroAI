import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisitPlannerHeaderProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: 'all',       label: 'All' },
  { id: 'high-risk', label: 'High Risk' },
  { id: 'revenue',   label: 'Revenue' },
  { id: 'follow-up', label: 'Follow-up' },
];

export function VisitPlannerHeader({ filter, onFilterChange }: VisitPlannerHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">
        AI Visit Planner
      </h2>
      <p className="mt-2 text-sm text-text-secondary dark:text-white/60">
        Priority-ranked visits based on risk scores, revenue potential, and farmer urgency.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-text-muted" />
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={cn(
              'px-4 py-2 rounded-pill text-sm font-medium transition-all duration-200',
              filter === f.id
                ? 'gradient-primary text-white shadow-sm'
                : 'bg-light-gray dark:bg-white/5 text-text-primary dark:text-white/70 hover:bg-light-gray/80 dark:hover:bg-white/10',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
