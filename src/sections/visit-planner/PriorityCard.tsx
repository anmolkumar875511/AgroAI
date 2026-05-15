import { MapPin, Clock, Sparkles } from 'lucide-react';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { cn } from '@/lib/utils';
import type { PriorityVisit } from '@/types';

interface PriorityCardProps {
  visit: PriorityVisit;
}

const tagColors: Record<string, string> = {
  green: 'bg-lime-green/15 text-deep-green',
  blue: 'bg-info-blue/10 text-info-blue',
  red: 'bg-danger-red/10 text-danger-red',
  yellow: 'bg-accent-yellow/10 text-accent-yellow',
};

export function PriorityCard({ visit }: PriorityCardProps) {
  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 border border-transparent dark:border-white/5">
      <div className="p-5 flex flex-col lg:flex-row gap-5 items-start">
        {/* Progress Ring */}
        <div className="flex-shrink-0 self-center lg:self-start">
          <ProgressRing progress={visit.score} size={100} strokeWidth={7} color="url(#ringGradient)" animate>
            <div className="text-center">
              <div className="text-2xl font-extrabold text-deep-green dark:text-lime-green">{visit.score}</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">Score</div>
            </div>
          </ProgressRing>
          <svg width="0" height="0">
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1B5E20" />
                <stop offset="100%" stopColor="#8BC34A" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-text-primary dark:text-white">{visit.name}</h4>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {visit.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Last visit: {visit.lastVisit}
            </span>
          </div>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            {visit.tags.map((tag, i) => (
              <span
                key={i}
                className={cn('px-2.5 py-1 rounded-full text-xs font-medium', tagColors[tag.color])}
              >
                {tag.label}
              </span>
            ))}
          </div>

          {/* AI Reason */}
          <div className="mt-4 p-3 rounded-lg bg-off-white dark:bg-white/5 border-l-[3px] border-lime-green">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-lime-green flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary dark:text-white/60 leading-relaxed">
                <span className="font-semibold text-lime-green">AI:</span> {visit.aiReason}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex lg:flex-col gap-2 flex-shrink-0 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none px-5 py-2.5 rounded-button gradient-primary text-white text-sm font-semibold hover:brightness-110 transition-all">
            {visit.actions[0]}
          </button>
          <button className="flex-1 lg:flex-none px-5 py-2.5 rounded-button bg-light-gray dark:bg-white/5 text-text-primary dark:text-white text-sm font-medium hover:bg-light-gray/80 transition-all">
            {visit.actions[1]}
          </button>
        </div>
      </div>
    </div>
  );
}
