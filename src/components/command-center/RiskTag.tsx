import { cn } from '@/lib/utils';

const variant: Record<string, string> = {
  danger: 'border-[#D32F2F]/50 text-[#FFCDD2] bg-[#D32F2F]/12',
  warn: 'border-[#F9A825]/45 text-[#FFE082] bg-[#F9A825]/12',
  success: 'border-[#388E3C]/50 text-[#C8E6C9] bg-[#388E3C]/12',
  info: 'border-[#1976D2]/45 text-[#BBDEFB] bg-[#1976D2]/12',
  neutral: 'border-white/15 text-slate-300 bg-white/5',
};

export function RiskTag({
  label,
  tone = 'neutral',
  className,
}: {
  label: string;
  tone?: keyof typeof variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold tracking-wide uppercase',
        variant[tone] ?? variant.neutral,
        className,
      )}
    >
      {label}
    </span>
  );
}
