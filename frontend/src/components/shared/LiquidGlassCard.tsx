import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  enableCursorGlow?: boolean;
  glowColor?: string;
}

export function LiquidGlassCard({
  children,
  className,
  enableCursorGlow = false,
  glowColor = 'rgba(139, 195, 74, 0.15)',
}: LiquidGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enableCursorGlow || !cardRef.current || !glowRef.current) return;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = cardRef.current!.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        glowRef.current!.style.background = `radial-gradient(circle at ${x}% ${y}%, ${glowColor}, transparent 70%)`;
      });
    },
    [enableCursorGlow, glowColor]
  );

  const handleMouseLeave = useCallback(() => {
    if (glowRef.current) {
      glowRef.current.style.background = 'transparent';
    }
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('liquid-glass', className)}
    >
      {/* Base blur layer - rendered by liquid-glass class */}
      {/* Edge highlight layer - rendered by liquid-glass class */}
      {/* Cursor glow layer */}
      {enableCursorGlow && (
        <div
          ref={glowRef}
          className="absolute inset-0 pointer-events-none rounded-inherit z-[2] transition-all duration-300"
        />
      )}
      {/* Content */}
      <div className="liquid-glass-content">{children}</div>
    </div>
  );
}
