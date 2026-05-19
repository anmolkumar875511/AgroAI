import { AlertTriangle, MapPin, Radio, ShieldAlert } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { RiskTag } from '@/components/command-center/RiskTag';
import { cn } from '@/lib/utils';

const baseAlerts = [
  {
    title: 'EARLY FUNGAL RISK DETECTED',
    district: 'Kanpur Rural',
    urgency: 'HIGH',
    signal: 'Humidity anomaly + wheat canopy stress',
    tags: ['HIGH PEST RISK', 'WEATHER ZONE'],
  },
  {
    title: 'INVENTORY GAP ESCALATION',
    district: 'Unnao Belt',
    urgency: 'MEDIUM',
    signal: 'Retailer stock below 2-day forecast demand',
    tags: ['LOW INVENTORY', 'HIGH SALES POTENTIAL'],
  },
];

export function SmartAlertCenter({ className }: { className?: string }) {
  const { pestOutbreakSim } = useDemoMode();
  const alerts = pestOutbreakSim
    ? [
        {
          title: 'PEST OUTBREAK SIMULATION ACTIVE',
          district: 'Kanpur Rural',
          urgency: 'CRITICAL',
          signal: 'Village scores recalculated; route and heatmap layers updated',
          tags: ['HIGH PEST RISK', 'ROUTE UPDATED'],
        },
        ...baseAlerts,
      ]
    : baseAlerts;

  return (
    <div className={cn('rounded-xl border border-white/10 bg-[#1E293B] overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0F172A]/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#D32F2F]/15 border border-[#D32F2F]/35 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-[#FFCDD2]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Smart alert center</h3>
            <p className="text-[10px] text-slate-500">Urgency-ranked field exceptions</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-[#F9A825]">
          <Radio className="w-3 h-3" /> Live
        </span>
      </div>

      <div className="p-3 space-y-3">
        {alerts.map((alert) => {
          const critical = alert.urgency === 'CRITICAL';
          const high = alert.urgency === 'HIGH' || critical;
          return (
            <div
              key={`${alert.title}-${alert.district}`}
              className={cn(
                'rounded-lg border p-3 bg-[#0F172A]/55 transition-all',
                high
                  ? 'border-[#D32F2F]/45 shadow-[0_0_16px_rgba(211,47,47,0.16)] ops-alert-pulse'
                  : 'border-[#F9A825]/35',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn('w-4 h-4 flex-shrink-0', high ? 'text-[#D32F2F]' : 'text-[#F9A825]')} />
                    <p className="text-xs font-bold tracking-wide text-white truncate">{alert.title}</p>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3" /> District: {alert.district}
                  </p>
                </div>
                <span
                  className={cn(
                    'px-2 py-1 rounded border text-[10px] font-bold',
                    high
                      ? 'border-[#D32F2F]/45 bg-[#D32F2F]/15 text-[#FFCDD2]'
                      : 'border-[#F9A825]/40 bg-[#F9A825]/12 text-[#FFE082]',
                  )}
                >
                  {alert.urgency}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">{alert.signal}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {alert.tags.map((tag) => (
                  <RiskTag
                    key={tag}
                    label={tag}
                    tone={tag.includes('PEST') ? 'danger' : tag.includes('INVENTORY') ? 'warn' : 'info'}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
