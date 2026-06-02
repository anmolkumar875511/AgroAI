import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  value: string;
  direction: 'up' | 'down';
  className?: string;
}

export function TrendIndicator({ value, direction, className }: TrendIndicatorProps) {
  const valueStr = typeof value === 'string' ? value : String(value ?? '');
  const isPositive = direction === 'up' && !valueStr.startsWith('-');
  const color = isPositive 
    ? 'text-lime-green bg-lime-green/10' 
    : valueStr.startsWith('-') && direction === 'down' 
      ? 'text-lime-green bg-lime-green/10' 
      : 'text-danger-red bg-danger-red/10';

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium', color, className)}>
      {direction === 'up' ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {valueStr}
    </span>
  );
}
