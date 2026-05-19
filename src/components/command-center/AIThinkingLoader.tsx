import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const STEPS = [
  'Analyzing rainfall anomalies...',
  'Checking pest bulletins...',
  'Optimizing routes...',
  'Generating recommendations...',
];

export function AIThinkingLoader({ className }: { className?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % STEPS.length), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-2 px-3 rounded-lg bg-[#1976D2]/10 border border-[#1976D2]/25',
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1976D2] opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1976D2]" />
      </span>
      <p className="text-xs font-medium text-[#BBDEFB] animate-pulse">{STEPS[i]}</p>
    </div>
  );
}
