import { useState } from 'react';
import { Search, MapPin, Clock, CheckCircle2, AlertCircle, Eye, Filter } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid
} from 'recharts';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import { managerAPI } from '@/api/client';

const TIMELINE_DATA: any[] = [];

const REPS_DATA: any[] = [];

const RECENT_ACTIVITIES: any[] = [];

export default function RepVisitTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('Today');
  const [territoryFilter, setTerritoryFilter] = useState('All');

  const { data, refetch } = useApi(
    () => managerAPI.getTeamTracking(),
    []
  );

  const liveReps = ((data as any)?.reps || REPS_DATA) as typeof REPS_DATA;
  const [selectedRep, setSelectedRep] = useState<typeof REPS_DATA[0] | null>(null);

  const filteredReps = liveReps.filter(rep => {
    const matchesSearch = rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.territory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTerritory = territoryFilter === 'All' || rep.territory.includes(territoryFilter);
    return matchesSearch && matchesTerritory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'Idle': return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      default: return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white tracking-tight">
          Rep-wise Visit Tracking
        </h1>
        <p className="text-text-secondary dark:text-white/60 text-sm mt-1">
          Monitor your field representatives' live locations, visits, timings, and logs.
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Visits Today', value: String((data as any)?.summary?.total_visits_today ?? 0), icon: CheckCircle2, desc: 'Across all territories', color: 'border-emerald-500/20 text-emerald-400' },
          { label: 'Completion Rate', value: `${(data as any)?.summary?.completion_rate ?? 0}%`, icon: CheckCircle2, desc: 'Target vs Completed', color: 'border-lime-green/20 text-lime-green' },
          { label: 'Avg Visit Duration', value: `${(data as any)?.summary?.avg_duration_min ?? 0} min`, icon: Clock, desc: 'Time spent per location', color: 'border-blue-400/20 text-blue-400' },
          { label: 'Overdue Visits', value: String((data as any)?.summary?.overdue_visits ?? 0), icon: AlertCircle, desc: 'Require immediate attention', color: 'border-rose-400/20 text-rose-400' },
        ].map((card, i) => (
          <div key={i} className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">{card.label}</p>
              <h3 className="text-2xl font-bold text-text-primary dark:text-white mt-1">{card.value}</h3>
              <p className="text-[10px] text-text-secondary dark:text-white/40 mt-0.5">{card.desc}</p>
            </div>
            <card.icon className={`w-8 h-8 ${card.color}`} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-4 shadow-card">
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-text-muted mr-1" />
          {['Today', 'This Week', 'This Month'].map((time) => (
            <button
              key={time}
              onClick={() => setTimeFilter(time)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                timeFilter === time
                  ? 'bg-deep-green text-white border-deep-green'
                  : 'border-light-gray dark:border-white/10 text-text-muted hover:bg-white/10'
              }`}
            >
              {time}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={territoryFilter}
            onChange={(e) => setTerritoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none"
          >
            <option value="All" className="bg-[#142818]">All Territories</option>
            <option value="Bihar" className="bg-[#142818]">Bihar</option>
            <option value="Maharashtra" className="bg-[#142818]">Maharashtra</option>
            <option value="Punjab" className="bg-[#142818]">Punjab</option>
            <option value="UP" className="bg-[#142818]">Uttar Pradesh</option>
            <option value="Gujarat" className="bg-[#142818]">Gujarat</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search representatives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-60 pl-9 pr-4 py-1.5 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:ring-1 focus:ring-lime-green/30"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Rep Table vs Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Column */}
        <div className="lg:col-span-2 backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card overflow-hidden">
          <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
            Field Agent Performance & Status
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-light-gray dark:border-white/10 text-text-muted font-semibold uppercase tracking-wider pb-3">
                  <th className="py-3 px-2">Rep Name</th>
                  <th className="py-3 px-2">Territory</th>
                  <th className="py-3 px-2 text-center">Visits Today</th>
                  <th className="py-3 px-2 text-center">Completion</th>
                  <th className="py-3 px-2 text-center">Last Active</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray dark:divide-white/5 text-text-primary dark:text-white/80">
                {filteredReps.map((rep) => {
                  const percent = Math.round((rep.visitsToday / rep.target) * 100);
                  return (
                    <tr key={rep.id} className="hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-2 font-semibold text-text-primary dark:text-white">{rep.name}</td>
                      <td className="py-4 px-2 text-text-secondary dark:text-white/60">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-lime-green flex-shrink-0" />
                          {rep.territory}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center font-medium">{rep.visitsToday} / {rep.target}</td>
                      <td className="py-4 px-2">
                        <div className="flex flex-col gap-1 items-center max-w-[80px] mx-auto">
                          <span className="text-[10px] text-text-muted">{percent}%</span>
                          <div className="w-full bg-light-gray dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-lime-green h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center text-text-muted">{rep.lastActive}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusColor(rep.status)}`}>
                          {rep.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button
                          onClick={() => setSelectedRep(rep)}
                          className="p-1 px-2.5 rounded bg-white/5 hover:bg-lime-green/20 hover:text-white text-lime-green transition-colors flex items-center gap-1 ml-auto text-[10px] font-bold"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card flex flex-col">
          <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
            Recent Visit Updates
          </h2>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[350px] pr-1">
            {((data as any)?.recent_activities || RECENT_ACTIVITIES).map((activity: any) => (
              <div key={activity.id} className="flex gap-3 text-xs leading-relaxed border-l-2 border-lime-green pl-3 hover:bg-white/5 p-1 rounded-r-md transition-colors">
                <div className="flex-1">
                  <p className="text-text-primary dark:text-white/90">{activity.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3 text-lime-green" /> {activity.time}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 border border-white/10 rounded-full bg-white/5 uppercase text-text-muted font-bold font-mono">
                      {activity.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={async () => {
              toast.info('Syncing latest logs from all representatives...');
              await refetch();
              toast.success('Logs synced successfully!');
            }}
            className="w-full text-center text-xs font-bold text-lime-green mt-4 pt-3 border-t border-light-gray dark:border-white/5 hover:underline"
          >
            Refresh Activities
          </button>
        </div>
      </div>

      {/* Recharts Area Chart: Weekly Visit Completion */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">
            Daily Completed Visits Trend (Past 7 Days)
          </h2>
          <span className="text-xs text-text-muted">Interactive Weekly View</span>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={(data as any)?.timeline || TIMELINE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8BC34A" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8BC34A" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSuresh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#1E88E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#142818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }}
              />
              <Area type="monotone" dataKey="Amit Sharma" stroke="#8BC34A" fillOpacity={1} fill="url(#colorAmit)" />
              <Area type="monotone" dataKey="Suresh Kumar" stroke="#1E88E5" fillOpacity={1} fill="url(#colorSuresh)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Rep Details Popup */}
      {selectedRep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRep(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#142818] border border-white/20 dark:border-white/10 rounded-card p-6 shadow-dropdown z-50">
            <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              Representative Intel: {selectedRep.name}
            </h3>
            <p className="text-xs text-text-secondary dark:text-white/60 mt-1">
              Active tracking profile with geo-coordinates and telemetry statistics.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6 text-xs bg-light-gray/20 dark:bg-white/5 p-4 rounded-xl">
              <div>
                <div className="text-text-muted">Territory</div>
                <div className="text-sm font-semibold text-text-primary dark:text-white mt-1">{selectedRep.territory}</div>
              </div>
              <div>
                <div className="text-text-muted">Visits Completed Today</div>
                <div className="text-sm font-semibold text-text-primary dark:text-white mt-1">{selectedRep.visitsToday} of {selectedRep.target}</div>
              </div>
              <div>
                <div className="text-text-muted">Last Handshake Active</div>
                <div className="text-sm font-semibold text-text-primary dark:text-white mt-1">{selectedRep.lastActive}</div>
              </div>
              <div>
                <div className="text-text-muted">Avg Visit Time Today</div>
                <div className="text-sm font-semibold text-text-primary dark:text-white mt-1">{selectedRep.duration} mins</div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setSelectedRep(null)}
                className="px-4 py-2 text-xs font-semibold rounded bg-light-gray dark:bg-white/5 text-text-primary dark:text-white hover:bg-light-gray/80 dark:hover:bg-white/10"
              >
                Close Intel
              </button>
              <button
                onClick={() => { setSelectedRep(null); toast.success(`Calling ${selectedRep.name}'s mobile terminal...`); }}
                className="px-4 py-2 text-xs font-semibold rounded bg-deep-green text-white hover:brightness-110"
              >
                Establish Voice Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
