import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: string;
  className?: string;
  showLabel?: boolean;
}

const priorityConfig = {
  critical: { bg: 'bg-danger-red/10', text: 'text-danger-red', dot: 'bg-danger-red', label: 'Critical' },
  high: { bg: 'bg-danger-red/10', text: 'text-danger-red', dot: 'bg-danger-red', label: 'High' },
  medium: { bg: 'bg-accent-yellow/10', text: 'text-accent-yellow', dot: 'bg-accent-yellow', label: 'Medium' },
  low: { bg: 'bg-lime-green/10', text: 'text-lime-green', dot: 'bg-lime-green', label: 'Low' },
};

export function PriorityBadge({ priority, className, showLabel = false }: PriorityBadgeProps) {
  const key = priority.toLowerCase() as keyof typeof priorityConfig;
  const config = priorityConfig[key] || priorityConfig.medium;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.bg, config.text, className)}>
      <span className={cn('w-2 h-2 rounded-full', config.dot)} />
      {showLabel && config.label}
    </span>
  );
}
