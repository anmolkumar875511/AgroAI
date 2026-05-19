import { cn } from '@/lib/utils';

interface WhyRecommendedBlockProps {
  bullets: string[];
  className?: string;
  title?: string;
}

export function WhyRecommendedBlock({
  bullets,
  className,
  title = 'Why recommended?',
}: WhyRecommendedBlockProps) {
  if (!bullets.length) return null;

  return (
    <div className={cn('rounded-lg border border-[#1976D2]/30 bg-[#0F172A]/60 p-3', className)}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1976D2]">{title}</p>
      <ul className="mt-2 space-y-1">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-xs text-slate-300 leading-snug">
            <span className="text-[#388E3C] mt-0.5">-</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
