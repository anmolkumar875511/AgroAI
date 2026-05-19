import { cn } from '@/lib/utils';

const DEFAULT_STEPS = [
  'Weather alert',
  'Pest risk increased',
  'Inventory risk detected',
  'Retailer prioritized',
  'Route updated',
];

export function AIRecommendationFlow({
  steps = DEFAULT_STEPS,
  className,
}: {
  steps?: string[];
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-white/10 bg-[#0F172A]/80 p-4', className)}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Inference chain</p>
      <ol className="space-y-0">
        {steps.map((label, idx) => (
          <li key={label} className="flex gap-3">
            <div className="flex flex-col items-center w-4 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#1976D2] shadow-[0_0_8px_rgba(25,118,210,0.5)] mt-1" />
              {idx < steps.length - 1 && <span className="w-px flex-1 min-h-[14px] bg-gradient-to-b from-[#1976D2]/80 to-white/10" />}
            </div>
            <span className="text-xs text-slate-200 pb-2 leading-snug">{label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
