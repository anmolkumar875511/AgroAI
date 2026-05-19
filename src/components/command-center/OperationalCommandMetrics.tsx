import CountUp from 'react-countup';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { TrendingUp, Target, MapPinned, Cpu, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OperationalCommandMetrics({ className }: { className?: string }) {
  const { pestOutbreakSim } = useDemoMode();
  const bump = pestOutbreakSim ? 6 : 0;

  const blocks = [
    {
      icon: IndianRupee,
      label: 'Revenue per field day',
      end: 42.6 + bump * 0.1,
      decimals: 1,
      prefix: 'Rs ',
      suffix: 'L',
      sub: 'Indexed vs territory baseline',
      color: 'text-[#388E3C]',
    },
    {
      icon: MapPinned,
      label: 'Coverage efficiency',
      end: 26 + Math.min(4, bump),
      decimals: 0,
      prefix: '+',
      suffix: '%',
      sub: 'Geo-weighted visit yield',
      color: 'text-[#1976D2]',
    },
    {
      icon: Target,
      label: 'Recommendation acceptance',
      end: 84 + (pestOutbreakSim ? 2 : 0),
      decimals: 0,
      prefix: '',
      suffix: '%',
      sub: 'Last 30 days - weighted',
      color: 'text-[#F9A825]',
    },
    {
      icon: Cpu,
      label: 'AI accuracy',
      end: 91.2,
      decimals: 1,
      prefix: '',
      suffix: '%',
      sub: 'Validated outcomes vs prediction',
      color: 'text-slate-200',
    },
    {
      icon: TrendingUp,
      label: 'Revenue impact',
      end: 18 + (pestOutbreakSim ? 4 : 0),
      decimals: 0,
      prefix: '+',
      suffix: '%',
      sub: 'Attributed uplift (model)',
      color: 'text-[#388E3C]',
    },
  ];

  return (
    <div className={cn('rounded-xl border border-white/10 bg-[#1E293B] overflow-hidden', className)}>
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-[#0F172A]/40">
        <h3 className="text-sm font-semibold text-white">Command metrics</h3>
        <span className="text-[10px] font-mono text-slate-500 uppercase">Live blend</span>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {blocks.map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-white/5 bg-[#0F172A]/50 p-4 hover:border-[#1976D2]/25 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <m.icon className="w-4 h-4 text-[#1976D2]" />
              </div>
              <span className="text-[10px] uppercase tracking-wide text-slate-500 leading-tight">{m.label}</span>
            </div>
            <div className={cn('text-2xl font-mono font-bold tabular-nums', m.color)}>
              {m.prefix}
              <CountUp end={m.end} duration={1.4} decimals={m.decimals} preserveValue />
              {m.suffix}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
