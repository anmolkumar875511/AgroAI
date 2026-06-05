/**
 * Empty State Component
 * UX FIX: Add empty states as per audit recommendation
 */
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-4">
        <div className="text-lime-green/60">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sage-green/70 max-w-sm mb-6">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="border-lime-green/30 text-lime-green hover:bg-lime-green/10"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
