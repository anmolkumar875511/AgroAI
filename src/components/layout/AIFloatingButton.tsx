import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIFloatingButtonProps {
  onClick: () => void;
}

export function AIFloatingButton({ onClick }: AIFloatingButtonProps) {
  return (
    <div className="fixed z-40 bottom-6 right-6 flex flex-col items-center gap-3">
      <button
        type="button"
        title="AI Field Copilot"
        onClick={onClick}
        className={cn(
          'relative w-14 h-14 rounded-full bg-[#2E7D32] border border-[#388E3C]/50 flex items-center justify-center',
          'shadow-[0_0_22px_rgba(46,125,50,0.35)] hover:scale-105 transition-all duration-300',
        )}
      >
        <Bot className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#1976D2] rounded-full border-2 border-[#0F172A] animate-pulse-dot" />
      </button>
    </div>
  );
}
