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

const polylineOptions = {
  strokeColor: '#34C759',
  strokeOpacity: 0.8,
  strokeWeight: 4,
};

const getMarkerIcon = (status: 'completed' | 'in-progress' | 'pending') => {
  const color = status === 'completed' ? '#34C759' : status === 'in-progress' ? '#007AFF' : '#FFCC00';
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

  const stops = routeData?.stops || [];
  const path = useMemo(() => stops.map(s => ({ lat: s.lat, lng: s.lng })), [stops]);

  if (!isLoaded || loading) {
    return (
      <div className="bg-white dark:bg-[#1A1D18] rounded-card shadow-card border border-light-gray dark:border-white/5 p-6 h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-green"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray dark:border-white/10">
        <h4 className="font-semibold text-text-primary dark:text-white">Optimized Route</h4>
        <span className="text-xs text-text-muted">
          {routeData?.total_stops || 0} stops · {routeData?.total_distance_km || 0}km · {routeData?.estimated_hours || 0}hrs
        </span>
      </div>

      <div className="relative h-[300px] bg-light-gray dark:bg-white/5 m-4 rounded-xl overflow-hidden z-0">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: activeRegion.lat, lng: activeRegion.lng }}
          zoom={activeRegion.zoom + 1}
          options={{ disableDefaultUI: true, zoomControl: true }}
        >
          {stops.length > 1 && <PolylineF path={path} options={polylineOptions} />}
          {stops.map((stop) => (
            <MarkerF key={stop.id}
              position={{ lat: stop.lat, lng: stop.lng }}
              icon={getMarkerIcon(stop.status as any)}
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
          className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 rounded-button bg-white dark:bg-[#1A1D18] shadow-dropdown text-sm font-medium text-text-primary dark:text-white hover:bg-light-gray transition-colors z-10">
          <RefreshCw className="w-4 h-4" />
          Recalculate
        </button>
      </div>
    </div>
  );
}