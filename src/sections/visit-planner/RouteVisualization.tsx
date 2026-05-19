// src/sections/visit-planner/RouteVisualization.tsx  — CHANGED
// What changed:
// - Added territoryId prop
// - Fetches route stops from visitPlannerAPI.getRoute() instead of hardcoded stops
// - Google Maps markers and polyline use live stop coordinates
// - Recalculate button calls refetch()

import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { GoogleMap, MarkerF, PolylineF, InfoWindowF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useRegion } from '@/contexts/RegionContext';
import { useApi } from '@/hooks/useApi';
import { visitPlannerAPI } from '@/api/client';
import { RouteEfficiencyMetrics } from '@/components/command-center/RouteEfficiencyMetrics';

const polylineOptions = {
  strokeColor: '#1976D2',
  strokeOpacity: 0.92,
  strokeWeight: 4,
};

const getMarkerIcon = (status: 'completed' | 'in-progress' | 'pending') => {
  const color = status === 'completed' ? '#388E3C' : status === 'in-progress' ? '#1976D2' : '#F9A825';
  return {
    path: typeof window !== 'undefined' && window.google ? google.maps.SymbolPath.CIRCLE : 0,
    fillColor: color, fillOpacity: 1, strokeWeight: 2, strokeColor: '#ffffff', scale: 10,
  };
};

const containerStyle = { width: '100%', height: '100%' };

interface RouteVisualizationProps {
  territoryId: string;  // NEW — was using hardcoded stops
}

export function RouteVisualization({ territoryId }: RouteVisualizationProps) {
  const [activeStop, setActiveStop] = useState<number | null>(null);
  const { isLoaded } = useGoogleMaps();
  const { activeRegion } = useRegion();

  // CHANGED: live route from backend
  const { data: routeData, loading, refetch } = useApi(
    () => visitPlannerAPI.getRoute(territoryId),
    [territoryId],
  );

  const stops = useMemo(() => routeData?.stops || [], [routeData?.stops]);
  const path = useMemo(() => stops.map(s => ({ lat: s.lat, lng: s.lng })), [stops]);

  if (!isLoaded || loading) {
    return (
      <div className="bg-[#1E293B] rounded-xl border border-white/10 p-6 h-[400px] flex items-center justify-center">
        <div className="text-xs font-medium text-[#1976D2] animate-pulse">Optimizing field route...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#1E293B] rounded-xl border border-white/10 h-full flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-white/10 bg-[#0F172A]/45">
        <div>
          <h4 className="font-semibold text-white">Optimized route command</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Priority stops, route line, and operational efficiency</p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {routeData?.total_stops || 0} stops - {routeData?.total_distance_km || 0}km - {routeData?.estimated_hours || 0}hrs
        </span>
      </div>

      <div className="relative h-[320px] bg-[#0F172A] m-4 rounded-lg overflow-hidden z-0 border border-white/10">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: activeRegion.lat, lng: activeRegion.lng }}
          zoom={activeRegion.zoom + 1}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            ],
          }}
        >
          {stops.length > 1 && <PolylineF path={path} options={polylineOptions} />}
          {stops.map((stop) => (
            <MarkerF key={stop.id}
              position={{ lat: stop.lat, lng: stop.lng }}
              icon={getMarkerIcon(stop.status)}
              label={{ text: String(stop.id), color: '#ffffff', fontSize: '12px', fontWeight: 'bold' }}
              onClick={() => setActiveStop(stop.id)}
            >
              {activeStop === stop.id && (
                <InfoWindowF position={{ lat: stop.lat, lng: stop.lng }} onCloseClick={() => setActiveStop(null)}>
                  <div className="text-xs font-medium text-gray-900 p-1">
                    {stop.name}<br />{stop.time}
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          ))}
        </GoogleMap>

        <button onClick={() => refetch()}
          className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F172A]/95 border border-[#1976D2]/35 text-sm font-medium text-[#BBDEFB] hover:bg-[#1976D2]/20 transition-colors z-10">
          <RefreshCw className="w-4 h-4" />
          Recalculate
        </button>
      </div>
      <div className="px-4 pb-4">
        <RouteEfficiencyMetrics />
      </div>
    </div>
  );
}
