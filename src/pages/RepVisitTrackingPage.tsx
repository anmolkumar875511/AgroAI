import { useState } from 'react';
import { Search, MapPin, Calendar, Clock, CheckCircle2, AlertCircle, Eye, Filter } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid
} from 'recharts';
import { toast } from 'sonner';

const TIMELINE_DATA = [
  { day: 'Mon', 'Amit Sharma': 5, 'Priya Tiwari': 4, 'Rajesh Verma': 3, 'Suresh Kumar': 6, 'Neha Singh': 5 },
  { day: 'Tue', 'Amit Sharma': 7, 'Priya Tiwari': 5, 'Rajesh Verma': 4, 'Suresh Kumar': 7, 'Neha Singh': 6 },
  { day: 'Wed', 'Amit Sharma': 6, 'Priya Tiwari': 6, 'Rajesh Verma': 5, 'Suresh Kumar': 8, 'Neha Singh': 7 },
  { day: 'Thu', 'Amit Sharma': 8, 'Priya Tiwari': 7, 'Rajesh Verma': 3, 'Suresh Kumar': 9, 'Neha Singh': 6 },
  { day: 'Fri', 'Amit Sharma': 9, 'Priya Tiwari': 8, 'Rajesh Verma': 6, 'Suresh Kumar': 8, 'Neha Singh': 8 },
  { day: 'Sat', 'Amit Sharma': 4, 'Priya Tiwari': 5, 'Rajesh Verma': 4, 'Suresh Kumar': 5, 'Neha Singh': 4 },
  { day: 'Sun', 'Amit Sharma': 2, 'Priya Tiwari': 3, 'Rajesh Verma': 2, 'Suresh Kumar': 3, 'Neha Singh': 3 },
];

const REPS_DATA = [
  { id: 1, name: 'Amit Sharma', territory: 'Patna, Bihar', visitsToday: 8, target: 10, duration: 34, status: 'Active', lastActive: '10:45 AM' },
  { id: 2, name: 'Priya Tiwari', territory: 'Amravati, Maharashtra', visitsToday: 6, target: 8, duration: 28, status: 'Active', lastActive: '11:20 AM' },
  { id: 3, name: 'Rajesh Verma', territory: 'Ludhiana, Punjab', visitsToday: 5, target: 8, duration: 40, status: 'Idle', lastActive: '09:30 AM' },
  { id: 4, name: 'Suresh Kumar', territory: 'Varanasi, UP', visitsToday: 9, target: 10, duration: 30, status: 'Active', lastActive: '11:45 AM' },
  { id: 5, name: 'Neha Singh', territory: 'Ahmedabad, Gujarat', visitsToday: 7, target: 8, duration: 32, status: 'Active', lastActive: '10:15 AM' },
];

const RECENT_ACTIVITIES = [
  { id: 1, text: 'Amit Sharma completed visit at Kisan Seed Store, Patna Sadar — Ordered 50 units Amistar 250 SC', time: '10 mins ago', type: 'order' },
  { id: 2, text: 'Priya Tiwari completed visit at Amravati Agri-Hub, Amravati Sadar — Follow-up needed for cotton growers', time: '25 mins ago', type: 'visit' },
  { id: 3, text: 'Suresh Kumar resolved pest outbreak alert at Varanasi Block B — Recommendation accepted', time: '40 mins ago', type: 'recommendation' },
  { id: 4, text: 'Neha Singh logged brand audit at Ahmedabad Seeds Center — Good stock levels maintained', time: '1 hr ago', type: 'audit' },
  { id: 5, text: 'Amit Sharma started optimization route for Patna Sadar territory', time: '1.5 hrs ago', type: 'route' },
  { id: 6, text: 'Rajesh Verma updated visit feedback at Ludhiana Fertilisers — High demand for Score 250 EC', time: '2 hrs ago', type: 'visit' },
  { id: 7, text: 'Priya Tiwari visited grower Ramrao Patil — Logged red rust infection symptoms on cotton', time: '3 hrs ago', type: 'visit' },
  { id: 8, text: 'Suresh Kumar checked in at Ganga Krishi Kendra — Placed bulk pesticide requirement', time: '4 hrs ago', type: 'order' },
];

export default function RepVisitTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('Today');
  const [territoryFilter, setTerritoryFilter] = useState('All');
  const [selectedRep, setSelectedRep] = useState<typeof REPS_DATA[0] | null>(null);

  const filteredReps = REPS_DATA.filter(rep => {
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
          { label: 'Total Visits Today', value: '47', icon: CheckCircle2, desc: 'Across all territories', color: 'border-emerald-500/20 text-emerald-400' },
          { label: 'Completion Rate', value: '78%', icon: CheckCircle2, desc: 'Target vs Completed', color: 'border-lime-green/20 text-lime-green' },
          { label: 'Avg Visit Duration', value: '32 min', icon: Clock, desc: 'Time spent per location', color: 'border-blue-400/20 text-blue-400' },
          { label: 'Overdue Visits', value: '8', icon: AlertCircle, desc: 'Require immediate attention', color: 'border-rose-400/20 text-rose-400' },
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
            {RECENT_ACTIVITIES.map((activity) => (
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
            onClick={() => toast.success('Syncing latest logs from all representatives...')}
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
            <AreaChart data={TIMELINE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
