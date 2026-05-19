import CountUp from 'react-countup';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { cn } from '@/lib/utils';

export function RouteEfficiencyMetrics({ className }: { className?: string }) {
  const { pestOutbreakSim } = useDemoMode();
  const fuel = pestOutbreakSim ? 24 : 18;
  const coverage = pestOutbreakSim ? 31 : 24;
  const travel = pestOutbreakSim ? 42 : 31;

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 p-3 rounded-lg border border-white/10 bg-[#0F172A]/60',
        className,
      )}
    >
      <Metric label="Fuel saved" suffix="%" value={fuel} />
      <Metric label="Coverage efficiency" prefix="+" suffix="%" value={coverage} />
      <div className="rounded-lg border border-white/5 bg-[#1E293B]/80 px-3 py-2.5">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Travel time reduced</div>
        <div className="text-lg font-mono font-bold text-[#1976D2] mt-0.5">
          <CountUp end={travel} duration={1.2} preserveValue /> <span className="text-sm font-sans text-slate-300">mins</span>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, prefix = '', suffix = '' }: { label: string; value: number; prefix?: string; suffix: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-[#1E293B]/80 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{label}</div>
      <div className="text-lg font-mono font-bold text-[#388E3C] mt-0.5">
        {prefix}
        <CountUp end={value} duration={1.2} preserveValue />
        {suffix}
      </div>
    </div>
  );
}
