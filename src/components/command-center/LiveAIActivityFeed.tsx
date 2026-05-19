import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { cn } from '@/lib/utils';

type FeedItem = { id: string; time: Date; text: string; urgent?: boolean };

const BASE: Omit<FeedItem, 'time'>[] = [
  { id: '1', text: 'Weather anomaly detected' },
  { id: '2', text: 'Pest risk increased' },
  { id: '3', text: '14 retailers reprioritized' },
  { id: '4', text: 'Route optimization completed' },
  { id: '5', text: 'Mandi price divergence flagged for wheat (Kanpur)' },
];

const DEMO_BURST: Omit<FeedItem, 'time'>[] = [
  { id: 'd1', text: 'Pest outbreak simulation - district alert escalated', urgent: true },
  { id: 'd2', text: 'Heatmap risk layer updated (high severity pockets)', urgent: true },
  { id: 'd3', text: 'Village priority scores recalculated', urgent: true },
  { id: 'd4', text: 'Active route replanned for Field Team A', urgent: true },
];

const ROTATING = [
  'NDVI stress index ingested from satellite pass',
  'Fungicide demand signal rising in 3 clusters',
  'Visit SLA: 2 overdue high-value stops surfaced',
];

function stamp(items: Omit<FeedItem, 'time'>[], from: Date): FeedItem[] {
  return items.map((b, i) => ({
    ...b,
    time: new Date(from.getTime() - (items.length - i) * 60_000),
  }));
}

export function LiveAIActivityFeed({ className }: { className?: string }) {
  const { pestOutbreakSim } = useDemoMode();
  const [liveLines, setLiveLines] = useState<FeedItem[]>([]);
  const baselineLines = useMemo(
    () => stamp(pestOutbreakSim ? [...DEMO_BURST, ...BASE] : BASE, new Date()),
    [pestOutbreakSim],
  );
  const lines = useMemo(() => [...liveLines, ...baselineLines].slice(0, 14), [baselineLines, liveLines]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const text = ROTATING[Math.floor(Math.random() * ROTATING.length)];
      setLiveLines((prev) => [{ id: `live-${Date.now()}`, time: new Date(), text }, ...prev].slice(0, 8));
    }, 20000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-[#1E293B] shadow-[0_0_0_1px_rgba(25,118,210,0.06)] overflow-hidden',
        className,
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0F172A]/50">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#388E3C] opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#388E3C]" />
          </span>
          <h3 className="text-sm font-semibold text-white tracking-tight">Live AI activity</h3>
        </div>
        <span className="text-[10px] font-mono uppercase text-slate-500">Ops feed</span>
      </div>
      <div className="max-h-[220px] overflow-y-auto p-3 space-y-2 scrollbar-hide">
        {lines.map((row) => (
          <div
            key={row.id}
            className={cn(
              'rounded-lg px-3 py-2 text-xs leading-relaxed border transition-colors',
              row.urgent
                ? 'border-[#D32F2F]/50 bg-[#D32F2F]/10 text-[#FFCDD2] shadow-[0_0_12px_rgba(211,47,47,0.15)] ops-alert-pulse'
                : 'border-white/5 bg-[#0F172A]/40 text-slate-300 hover:border-white/10',
            )}
          >
            <div className="text-[10px] font-mono text-slate-500 mb-0.5">
              {format(row.time, 'h:mm a')}
            </div>
            {row.text}
          </div>
        ))}
      </div>
    </div>
  );
}

