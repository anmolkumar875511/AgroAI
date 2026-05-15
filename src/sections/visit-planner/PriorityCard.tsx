import { useState } from 'react';
import { MapPin, Clock, Sparkles, X } from 'lucide-react';
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
  const [actionState, setActionState] = useState<'idle' | 'loading' | 'completed'>('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePrimaryAction = () => {
    setActionState('loading');
    setTimeout(() => {
      setActionState('completed');
    }, 1000);
  };

  const handleSecondaryAction = () => {
    setIsModalOpen(true);
  };

  const getSuccessText = (action: string) => {
    if (action.includes('Start')) return 'Visit Started ✓';
    if (action.includes('Plan')) return 'Added to Route ✓';
    if (action.includes('Follow')) return 'Follow Up Set ✓';
    if (action.includes('Update')) return 'Stock Updated ✓';
    return 'Action Done ✓';
  };

  return (
    <>
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
            <button 
              onClick={handlePrimaryAction}
              disabled={actionState !== 'idle'}
              className={cn(
                "flex-1 lg:flex-none px-5 py-2.5 rounded-button text-sm font-semibold transition-all flex justify-center items-center",
                actionState === 'completed' 
                  ? 'bg-lime-green text-white' 
                  : 'gradient-primary text-white hover:brightness-110',
                actionState === 'loading' && 'opacity-80 cursor-not-allowed'
              )}
            >
              {actionState === 'loading' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : actionState === 'completed' ? (
                getSuccessText(visit.actions[0])
              ) : (
                visit.actions[0]
              )}
            </button>
            <button 
              onClick={handleSecondaryAction}
              className="flex-1 lg:flex-none px-5 py-2.5 rounded-button bg-light-gray dark:bg-white/5 text-text-primary dark:text-white text-sm font-medium hover:bg-light-gray/80 transition-all"
            >
              {visit.actions[1]}
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-deep-forest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-light-gray dark:border-white/10 animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-light-gray dark:border-white/10 flex justify-between items-center bg-off-white dark:bg-white/5">
              <h3 className="font-semibold text-lg text-text-primary dark:text-white">
                {visit.actions[1].includes('Alert') ? 'Send Alert' : 'Detailed Profile'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-full hover:bg-light-gray dark:hover:bg-white/10 text-text-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-light-gray dark:border-white/5">
                <div className="w-12 h-12 rounded-full bg-lime-green/20 flex items-center justify-center text-deep-green dark:text-lime-green font-bold text-lg">
                  {visit.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-text-primary dark:text-white">{visit.name}</h4>
                  <div className="text-sm text-text-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {visit.location}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-light-gray/30 dark:bg-white/5 p-4 rounded-xl">
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">AI Insight</div>
                  <div className="text-sm font-medium text-text-primary dark:text-white">{visit.aiReason}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-light-gray/30 dark:bg-white/5 p-3 rounded-xl">
                    <div className="text-xs text-text-muted mb-1">Priority Score</div>
                    <div className="text-lg font-bold text-deep-green dark:text-lime-green">{visit.score}/100</div>
                  </div>
                  <div className="bg-light-gray/30 dark:bg-white/5 p-3 rounded-xl">
                    <div className="text-xs text-text-muted mb-1">Last Interaction</div>
                    <div className="text-sm font-semibold text-text-primary dark:text-white">{visit.lastVisit}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-2.5 rounded-lg bg-light-gray dark:bg-white/5 text-text-primary dark:text-white font-medium hover:bg-light-gray/80 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    handlePrimaryAction();
                  }} 
                  className="flex-1 py-2.5 rounded-lg gradient-primary text-white font-medium hover:brightness-110 transition-all shadow-glow-green"
                >
                  {visit.actions[0]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
