import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Clock, CheckCircle2, AlertCircle, Eye, Filter, Shield } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import { managerAPI } from '@/api/client';
import { useRegion } from '@/contexts/RegionContext';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

// Premium dark forest-green styled map for dark theme
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0B150C" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0B150C" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#748875" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1B301D" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#A3BBA4" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#0F1F10" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#132715" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#546A56" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1E3520" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#5F7861" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#254328" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#769578" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#162D18" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#070E08" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#2E4731" }] }
];

// Elegant silver-green styled map for light theme
const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f7f5" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4f6350" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#e2e7e2" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#ebf0eb" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e1ede2" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#5a7a5c" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6b7d6c" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f8fbf8" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9dfcb" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3f5441" }] }
];

const containerStyle = { width: '100%', height: '100%' };

const getMarkerIcon = (isActive: boolean, isIdle = false) => {
  const color = isIdle ? '#f59e0b' : '#22c55e'; // orange for idle, green for active
  return {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: color,
    fillOpacity: isActive ? 1 : 0.65,
    strokeWeight: isActive ? 2 : 1,
    strokeColor: '#ffffff',
    scale: isActive ? 1.6 : 1.3,
    anchor: typeof window !== 'undefined' && window.google ? new window.google.maps.Point(12, 22) : undefined,
  };
};

export default function RepVisitTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('Today');
  const [territoryFilter, setTerritoryFilter] = useState('All');
  const { activeRegion } = useRegion();
  const { isLoaded } = useGoogleMaps();
  const { theme } = useTheme();

  // Local state for live websocket coordinates registry
  const [liveRepsMap, setLiveRepsMap] = useState<Record<number, any>>({});
  const [mapActiveMarker, setMapActiveMarker] = useState<number | null>(null);

  // Fetch performance status from API (database source)
  const { data, refetch } = useApi(
    () => managerAPI.getTeamTracking(activeRegion.id),
    [activeRegion.id]
  );

  // Initialize and listen to websocket tracking events
  useEffect(() => {
    const handleTrackingEvent = (e: Event) => {
      const payload = (e as CustomEvent).detail;
      if (payload.type === 'reps_list') {
        const newMap: Record<number, any> = {};
        payload.reps.forEach((rep: any) => {
          newMap[rep.id] = rep;
        });
        setLiveRepsMap(newMap);
      } else if (payload.type === 'rep_location_update') {
        setLiveRepsMap(prev => ({
          ...prev,
          [payload.rep.id]: payload.rep
        }));
      }
    };

    window.addEventListener('agroai_websocket_tracking_update', handleTrackingEvent);
    return () => {
      window.removeEventListener('agroai_websocket_tracking_update', handleTrackingEvent);
    };
  }, []);

  const liveReps = useMemo(() => {
    const apiReps = ((data as any)?.reps || []) as any[];
    
    // Map of reps from database
    const mapped = apiReps.map(rep => {
      // Overwrite static metrics with live websockets coordinates if available
      const liveData = liveRepsMap[rep.id];
      if (liveData) {
        return {
          ...rep,
          lat: liveData.lat,
          lng: liveData.lng,
          status: liveData.status || rep.status,
          lastActive: liveData.lastActive || rep.lastActive
        };
      }
      // If no live telemetry but region matches, populate default fallback coordinates for display
      const defaultCoords = { lat: activeRegion.lat, lng: activeRegion.lng };
      return {
        lat: defaultCoords.lat + (rep.id * 0.015) - 0.03,
        lng: defaultCoords.lng + (rep.id * 0.015) - 0.03,
        ...rep
      };
    });

    // Also include any newly created users that are active but not in database cache yet
    Object.values(liveRepsMap).forEach((liveRep: any) => {
      if (!mapped.some(r => r.id === liveRep.id)) {
        mapped.push({
          id: liveRep.id,
          name: liveRep.name,
          territory: liveRep.territory,
          visitsToday: 0,
          target: 8,
          duration: 30,
          status: liveRep.status || 'Active',
          lastActive: liveRep.lastActive || 'Just now',
          lat: liveRep.lat,
          lng: liveRep.lng
        });
      }
    });

    return mapped;
  }, [data, liveRepsMap, activeRegion]);

  const [selectedRep, setSelectedRep] = useState<any | null>(null);

  const filteredReps = liveReps.filter(rep => {
    const matchesSearch = rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.territory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTerritory = territoryFilter === 'All' || rep.territory.toLowerCase().includes(territoryFilter.toLowerCase());
    return matchesSearch && matchesTerritory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'Idle': return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      default: return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
    }
  };

  const mapStyles = theme === 'dark' ? darkMapStyle : lightMapStyle;

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-lime-green" />
            Rep-wise Visit Tracking
          </h1>
          <p className="text-text-secondary dark:text-white/60 text-sm mt-1">
            Monitor your field representatives' live locations, visits, timings, and logs.
          </p>
        </div>
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

      {/* Real-Time Tracking Google Map Widget */}
      <div className="backdrop-blur-md bg-white/80 dark:bg-[#121b14]/40 rounded-2xl shadow-card border border-white/30 dark:border-white/5 h-[450px] flex flex-col overflow-hidden animate-fade-in relative z-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray dark:border-white/5">
          <h3 className="font-semibold text-text-primary dark:text-white text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-green animate-ping" />
            Live Representative Telemetry Monitor
          </h3>
          <span className="text-[10px] font-bold text-lime-green px-2 py-0.5 bg-lime-green/10 border border-lime-green/20 rounded-full">
            WebSockets Live
          </span>
        </div>
        <div className="flex-1 bg-light-gray/60 dark:bg-[#0b150c]/40 m-4 rounded-xl overflow-hidden border border-light-gray dark:border-white/5 relative">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={{ lat: activeRegion.lat, lng: activeRegion.lng }}
              zoom={activeRegion.zoom + 1}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                styles: mapStyles
              }}
            >
              {filteredReps.map(rep => (
                <MarkerF
                  key={rep.id}
                  position={{ lat: rep.lat, lng: rep.lng }}
                  icon={getMarkerIcon(mapActiveMarker === rep.id, rep.status === 'Idle')}
                  onClick={() => setMapActiveMarker(rep.id)}
                >
                  {mapActiveMarker === rep.id && (
                    <InfoWindowF
                      position={{ lat: rep.lat, lng: rep.lng }}
                      onCloseClick={() => setMapActiveMarker(null)}
                      options={{ pixelOffset: new window.google.maps.Size(0, -32) }}
                    >
                      <div className="text-xs font-semibold text-gray-900 p-2 min-w-[180px] bg-white rounded-lg">
                        <span className={cn(
                          "block text-[9px] uppercase tracking-widest font-extrabold mb-1",
                          rep.status === 'Active' ? "text-lime-green" : "text-amber-500"
                        )}>
                          {rep.status}
                        </span>
                        <h4 className="text-text-primary font-bold text-sm mb-1">{rep.name}</h4>
                        <p className="text-gray-500 text-[10px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-lime-green" /> {rep.territory}
                        </p>
                        <p className="text-gray-500 text-[10px] mt-1">
                          Visits Today: <strong>{rep.visitsToday} / {rep.target}</strong>
                        </p>
                        <p className="text-gray-400 text-[9px] mt-0.5">
                          Last Active: {rep.lastActive}
                        </p>
                        <button
                          onClick={() => {
                            setMapActiveMarker(null);
                            toast.success(`Voice handshake link created with ${rep.name}`);
                          }}
                          className="w-full mt-2 py-1 text-center bg-lime-green/10 hover:bg-lime-green/20 text-lime-green text-[9px] rounded font-bold uppercase tracking-wider transition-colors"
                        >
                          Establish Voice Link
                        </button>
                      </div>
                    </InfoWindowF>
                  )}
                </MarkerF>
              ))}
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-green" />
            </div>
          )}
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-[#142016]/90 backdrop-blur-md shadow-md border border-white/20 dark:border-white/10 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse" />
              <span className="text-[10px] font-bold text-text-secondary dark:text-white/80 uppercase">Active Agent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
              <span className="text-[10px] font-bold text-text-secondary dark:text-white/80 uppercase">Idle Agent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
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
            <option value="Karnataka" className="bg-[#142818]">Karnataka</option>
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
            {((data as any)?.recent_activities || []).map((activity: any) => (
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
            {((data as any)?.recent_activities || []).length === 0 && (
              <p className="text-xs text-text-muted text-center py-6">No recent updates.</p>
            )}
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
            <AreaChart data={(data as any)?.timeline || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
          <div className="relative w-full max-w-lg bg-white dark:bg-[#142818] border border-white/20 dark:border-white/10 rounded-card p-6 shadow-dropdown z-50 animate-in fade-in zoom-in duration-250">
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
