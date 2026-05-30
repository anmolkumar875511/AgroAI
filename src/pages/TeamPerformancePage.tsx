import { useState } from 'react';
import { MapPin, Mail, Search } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend
} from 'recharts';
import { toast } from 'sonner';

const COLORS = {
  primary: '#1B5E20',
  secondary: '#8BC34A',
  yellow: '#FFC107',
  blue: '#1E88E5',
  red: '#E53935',
};

const REP_PERFORMANCE_DETAILS = [
  { name: 'Amit Sharma', territory: 'Patna North', visits: 38, target: 40, sales: 320000, activeGrowers: 145, rating: 4.8, status: 'Active' },
  { name: 'Priya Tiwari', territory: 'Muzaffarpur South', visits: 29, target: 35, sales: 245000, activeGrowers: 120, rating: 4.6, status: 'Active' },
  { name: 'Rajesh Verma', territory: 'Gaya West', visits: 31, target: 40, sales: 260000, activeGrowers: 132, rating: 4.4, status: 'Offline' },
];

const DAILY_LOGS = [
  { time: '04:30 PM', rep: 'Amit Sharma', type: 'Visit Complete', retailer: 'Kisan Seed Store', detail: 'Discussed Amistar, order value of ₹45k placed.' },
  { time: '02:15 PM', rep: 'Priya Tiwari', type: 'Visit Complete', retailer: 'Mahavir Fertilizers', detail: 'Stock count verified, low inventory of Actara reported.' },
  { time: '11:00 AM', rep: 'Amit Sharma', type: 'Meeting Done', retailer: 'Patna Agri Association', detail: 'Addressed crop protection concerns for wheat sowing season.' },
  { time: '10:15 AM', rep: 'Rajesh Verma', type: 'Route Started', retailer: 'N/A', detail: 'Route optimization synced successfully.' },
];

export default function TeamPerformancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRep, setSelectedRep] = useState<string | null>(null);

  const filteredReps = REP_PERFORMANCE_DETAILS.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.territory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartData = REP_PERFORMANCE_DETAILS.map(r => ({
    name: r.name,
    Visits: r.visits,
    Target: r.target,
    Sales_k: Math.round(r.sales / 1000),
  }));

  const handleMessageTeam = () => {
    toast.success('Broadcast notification sent successfully to all field agents!');
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white tracking-tight">
            Team Performance & Activities
          </h1>
          <p className="text-text-secondary dark:text-white/60 text-sm mt-1">
            Track individual representative logs, sales achievements, and targets.
          </p>
        </div>

        <button
          onClick={handleMessageTeam}
          className="flex items-center gap-2 px-4 py-2 rounded-button bg-deep-green text-white text-sm font-semibold hover:brightness-110 transition-all shadow-md shadow-deep-green/20"
        >
          <Mail className="w-4 h-4" />
          <span>Broadcast Message</span>
        </button>
      </div>

      {/* Grid of Chart vs Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card">
          <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
            Visits vs Targets Comparison
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(120,130,120,0.8)" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#142818', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Visits" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Target" fill="rgba(120,130,120,0.3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Logs */}
        <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary dark:text-white mb-4">
              Real-Time Field Logs
            </h2>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {DAILY_LOGS.map((log, index) => (
                <div key={index} className="flex gap-3 text-xs leading-relaxed border-l-2 border-lime-green pl-3">
                  <div className="flex-shrink-0 text-text-muted text-[10px] font-mono">{log.time}</div>
                  <div>
                    <div className="font-bold text-text-primary dark:text-white">
                      {log.rep} <span className="font-normal text-text-secondary dark:text-white/60">· {log.type}</span>
                    </div>
                    <div className="text-text-muted mt-0.5">{log.retailer}</div>
                    <p className="text-text-secondary dark:text-white/60 mt-1">{log.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => toast.success('Pulling latest logs...')}
            className="w-full text-center text-xs font-bold text-lime-green mt-4 pt-3 border-t border-light-gray dark:border-white/5 hover:underline"
          >
            Load Older Activities
          </button>
        </div>
      </div>

      {/* Rep Details Card/Grid */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-[#122315]/30 border border-white/20 dark:border-white/10 rounded-card p-5 shadow-card">
        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 gap-4 border-b border-light-gray dark:border-white/10">
          <h2 className="text-lg font-bold text-text-primary dark:text-white">
            Individual Performance Records
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search representative..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-button bg-white dark:bg-white/5 border border-light-gray dark:border-white/10 text-text-primary dark:text-white outline-none focus:ring-1 focus:ring-lime-green/30"
            />
          </div>
        </div>

        {/* Rep Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {filteredReps.map((rep, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-light-gray dark:border-white/5 bg-light-gray/20 dark:bg-white/5 hover:border-lime-green/30 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-lime-green/10 flex items-center justify-center font-bold text-lime-green">
                      {rep.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary dark:text-white text-sm">{rep.name}</h3>
                      <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-lime-green" /> {rep.territory}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    rep.status === 'Active' ? 'bg-lime-green/10 text-lime-green' : 'bg-light-gray dark:bg-white/10 text-text-muted'
                  }`}>
                    {rep.status}
                  </span>
                </div>

                {/* Performance stats list */}
                <div className="space-y-2 mt-5 text-xs text-text-secondary dark:text-white/70">
                  <div className="flex justify-between">
                    <span>Visits completed:</span>
                    <span className="font-semibold text-text-primary dark:text-white">{rep.visits} / {rep.target}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue generated:</span>
                    <span className="font-semibold text-lime-green">₹{(rep.sales/1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active grower nodes:</span>
                    <span className="font-semibold text-text-primary dark:text-white">{rep.activeGrowers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client satisfaction rating:</span>
                    <span className="font-semibold text-accent-yellow">★ {rep.rating} / 5.0</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-light-gray dark:border-white/5">
                <button
                  onClick={() => toast.success(`Calling ${rep.name}...`)}
                  className="flex-1 py-1.5 rounded bg-light-gray dark:bg-white/5 text-xs font-semibold text-text-primary dark:text-white hover:bg-light-gray/80 dark:hover:bg-white/10 transition-colors"
                >
                  Call Rep
                </button>
                <button
                  onClick={() => setSelectedRep(rep.name)}
                  className="flex-1 py-1.5 rounded bg-deep-green text-xs font-semibold text-white hover:brightness-110 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Rep detailed popup sheet */}
      {selectedRep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRep(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#142818] border border-white/20 dark:border-white/10 rounded-card p-6 shadow-dropdown z-50">
            <h3 className="text-lg font-bold text-text-primary dark:text-white">
              Representative Profile: {selectedRep}
            </h3>
            <p className="text-xs text-text-secondary dark:text-white/60 mt-1">
              Showing detailed weekly performance analytics & GPS route telemetry.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6 text-xs bg-light-gray/20 dark:bg-white/5 p-4 rounded-xl">
              <div>
                <div className="text-text-muted">Total Route Hours</div>
                <div className="text-base font-bold text-text-primary dark:text-white mt-1">34.5 hrs</div>
              </div>
              <div>
                <div className="text-text-muted">Avg Visit Duration</div>
                <div className="text-base font-bold text-text-primary dark:text-white mt-1">42 mins</div>
              </div>
              <div>
                <div className="text-text-muted">Mandi Price Syncs</div>
                <div className="text-base font-bold text-text-primary dark:text-white mt-1">12 completed</div>
              </div>
              <div>
                <div className="text-text-muted">WhatsApp Campaigns Sent</div>
                <div className="text-base font-bold text-text-primary dark:text-white mt-1">220 messages</div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setSelectedRep(null)}
                className="px-4 py-2 text-xs font-semibold rounded bg-light-gray dark:bg-white/5 text-text-primary dark:text-white hover:bg-light-gray/80 dark:hover:bg-white/10"
              >
                Close Profile
              </button>
              <button
                onClick={() => { setSelectedRep(null); toast.success('Profile synced with manager device!'); }}
                className="px-4 py-2 text-xs font-semibold rounded bg-deep-green text-white hover:brightness-110"
              >
                Sync Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
