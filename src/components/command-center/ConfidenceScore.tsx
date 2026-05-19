import { cn } from '@/lib/utils';
import { confidenceTone } from '@/lib/fieldOps';

export function ConfidenceScore({ pct }: { pct: number }) {
  const tone = confidenceTone(pct);
  const color =
    tone === 'high'
      ? 'text-[#388E3C]'
      : tone === 'mid'
        ? 'text-[#F9A825]'
        : 'text-[#D32F2F]';

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Confidence score</span>
      <span className={cn('text-sm font-mono font-bold tabular-nums', color)}>{pct}%</span>
    </div>
  );
}
