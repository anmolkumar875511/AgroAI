import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

const insights = [
  { icon: AlertTriangle, color: 'text-danger-red', bg: 'bg-danger-red/10', text: '3 villages show critical risk spike' },
  { icon: TrendingUp, color: 'text-accent-yellow', bg: 'bg-accent-yellow/10', text: 'Stem Borer outbreak probability: 78%' },
  { icon: CheckCircle, color: 'text-lime-green', bg: 'bg-lime-green/10', text: 'Recommend immediate field visits' },
];

export function AIInsightsPanel() {
  return (
    <div className="mt-4 bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h4 className="font-semibold text-text-primary dark:text-white mb-4">AI Insights</h4>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg ${insight.bg} flex items-center justify-center flex-shrink-0`}>
              <insight.icon className={`w-4 h-4 ${insight.color}`} />
            </div>
            <p className="text-sm text-text-secondary dark:text-white/70 pt-1">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
