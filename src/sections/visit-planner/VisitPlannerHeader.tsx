import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisitPlannerHeaderProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: 'all', label: 'All' },
  { id: 'high-risk', label: 'High Risk' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'follow-up', label: 'Follow-up' },
];

export function VisitPlannerHeader({ filter, onFilterChange }: VisitPlannerHeaderProps) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#1976D2]">ML visit sequencing</p>
      <h2 className="text-2xl lg:text-3xl font-bold text-white mt-1">
        AI Visit Planner
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Priority-ranked visits based on risk scores, revenue potential, and farmer urgency.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-slate-500" />
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={cn(
              'px-4 py-2 rounded-pill text-sm font-medium transition-all duration-200',
              filter === f.id
                ? 'bg-[#2E7D32] text-white border border-[#388E3C]/40 shadow-[0_0_14px_rgba(46,125,50,0.18)]'
                : 'bg-[#1E293B] border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
