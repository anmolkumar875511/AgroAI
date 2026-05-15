import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIFloatingButtonProps {
  onClick: () => void;
}

export function AIFloatingButton({ onClick }: AIFloatingButtonProps) {
  return (
    <div className="fixed z-40 lg:bottom-6 lg:left-[276px] bottom-6 right-6 flex flex-col items-center gap-3">
      <button
        onClick={onClick}
        className={cn(
          'w-14 h-14 rounded-full gradient-primary flex items-center justify-center',
          'shadow-glow-green hover:scale-110 transition-all duration-300',
          'animate-border-glow-green'
        )}
      >
        <Bot className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-lime-green rounded-full animate-pulse-dot" />
      </button>
    </div>
  );
}
