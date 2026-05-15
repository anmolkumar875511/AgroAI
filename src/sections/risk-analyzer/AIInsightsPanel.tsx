import { useState } from 'react';
import { AlertTriangle, TrendingUp, CheckCircle, BellRing, CalendarPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const insights = [
  { icon: AlertTriangle, color: 'text-danger-red', bg: 'bg-danger-red/10', text: '3 villages show critical risk spike' },
  { icon: TrendingUp, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10', text: 'Stem Borer outbreak probability: 78%' },
  { icon: CheckCircle, color: 'text-lime-green', bg: 'bg-lime-green/10', text: 'Recommend immediate field visits' },
];

export function AIInsightsPanel() {
  const [actionState, setActionState] = useState<'idle' | 'loading_visit' | 'loading_alert' | 'success_visit' | 'success_alert'>('idle');

  const handleAction = (type: 'visit' | 'alert') => {
    setActionState(type === 'visit' ? 'loading_visit' : 'loading_alert');
    setTimeout(() => {
      setActionState(type === 'visit' ? 'success_visit' : 'success_alert');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setActionState('idle');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="mt-4 bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-text-primary dark:text-white">AI Insights for Selected Region</h4>
        <span className="px-2.5 py-1 rounded-full bg-danger-red/10 text-danger-red text-[11px] font-bold uppercase tracking-wide">
          High Risk
        </span>
      </div>
      
      <div className="space-y-3 mb-6">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg ${insight.bg} flex items-center justify-center flex-shrink-0`}>
              <insight.icon className={`w-4 h-4 ${insight.color}`} />
            </div>
            <p className="text-sm text-text-secondary dark:text-white/70 pt-1">{insight.text}</p>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="border-t border-light-gray dark:border-white/10 pt-4 flex flex-col sm:flex-row gap-3">
        {actionState.includes('success') ? (
          <div className="flex-1 py-2.5 px-4 rounded-lg bg-lime-green/10 border border-lime-green/20 flex items-center justify-center gap-2 text-lime-green font-medium animate-in fade-in zoom-in-95">
            <CheckCircle className="w-5 h-5" />
            {actionState === 'success_visit' ? 'Visits Scheduled for 3 Villages' : 'Alert Broadcasted to 142 Farmers'}
          </div>
        ) : (
          <>
            <button
              onClick={() => handleAction('visit')}
              disabled={actionState !== 'idle'}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg gradient-primary text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-glow-green hover:scale-[1.02]",
                actionState === 'loading_visit' && "opacity-80 cursor-not-allowed",
                actionState === 'loading_alert' && "hidden"
              )}
            >
              {actionState === 'loading_visit' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CalendarPlus className="w-4 h-4" />
                  Schedule Field Visits
                </>
              )}
            </button>
            <button
              onClick={() => handleAction('alert')}
              disabled={actionState !== 'idle'}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg bg-danger-red text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-danger-red/90 hover:scale-[1.02]",
                actionState === 'loading_alert' && "opacity-80 cursor-not-allowed",
                actionState === 'loading_visit' && "hidden"
              )}
            >
              {actionState === 'loading_alert' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <BellRing className="w-4 h-4" />
                  Broadcast Warning Alert
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
