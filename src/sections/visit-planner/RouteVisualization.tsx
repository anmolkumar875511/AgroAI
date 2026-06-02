// src/sections/visit-planner/RouteVisualization.tsx  — CHANGED
// What changed:
// - Added territoryId prop
// - Fetches route stops from visitPlannerAPI.getRoute() instead of hardcoded stops
// - Google Maps markers and polyline use live stop coordinates
// - Recalculate button calls refetch()
// - Implemented premium SVG teardrop pins, centered number labels, and light/dark forest-green themes
import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { GoogleMap, MarkerF, PolylineF, InfoWindowF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useRegion } from '@/contexts/RegionContext';
import { useApi } from '@/hooks/useApi';
import { visitPlannerAPI } from '@/api/client';
import { useTheme } from '@/contexts/ThemeContext';

const polylineOptions = {
  strokeColor: '#34C759',
  strokeOpacity: 0.8,
  strokeWeight: 4,
};

// Premium SVG teardrop marker path with color styling and labelOrigin centered in the cutout
const getMarkerIcon = (status: 'completed' | 'in-progress' | 'pending') => {
  let color = '#22c55e'; // Green for completed
  if (status === 'in-progress') color = '#3b82f6'; // Blue for active/in-progress
  else if (status === 'pending') color = '#ef4444'; // Red for pending/risk

  return {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 1.8,
    strokeColor: '#ffffff',
    scale: 1.4,
    anchor: typeof window !== 'undefined' && window.google ? new window.google.maps.Point(12, 22) : undefined,
    labelOrigin: typeof window !== 'undefined' && window.google ? new window.google.maps.Point(12, 9) : undefined,
  };
};

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

interface RouteVisualizationProps {
  territoryId: string;
}

export function RouteVisualization({ territoryId }: RouteVisualizationProps) {
  const [activeStop, setActiveStop] = useState<number | null>(null);
  const { isLoaded } = useGoogleMaps();
  const { activeRegion } = useRegion();
  const { theme } = useTheme();

  // CHANGED: live route from backend
  const { data: routeData, loading, refetch } = useApi(
    () => visitPlannerAPI.getRoute(territoryId),
    [territoryId],
  );

  const stops = routeData?.stops || [];
  const path = useMemo(() => stops.map(s => ({ lat: s.lat || 0, lng: s.lng || 0 })), [stops]);
  const mapStyles = theme === 'dark' ? darkMapStyle : lightMapStyle;

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
          {stops.length} stops · {routeData?.total_km || 0}km · {routeData ? Math.round(routeData.total_time_min / 60) : 0}hrs
        </span>
      </div>

      <div className="relative h-[300px] bg-light-gray dark:bg-white/5 m-4 rounded-xl overflow-hidden z-0">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: activeRegion.lat, lng: activeRegion.lng }}
          zoom={activeRegion.zoom + 1}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: mapStyles,
          }}
        >
          {stops.length > 1 && <PolylineF path={path} options={polylineOptions} />}
          {stops.map((stop) => (
            <MarkerF key={stop.order}
              position={{ lat: stop.lat || 0, lng: stop.lng || 0 }}
              icon={getMarkerIcon('pending')}
              label={{ text: String(stop.order), color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
              onClick={() => setActiveStop(stop.order)}
            >
              {activeStop === stop.order && (
                <InfoWindowF position={{ lat: stop.lat || 0, lng: stop.lng || 0 }} onCloseClick={() => setActiveStop(null)}>
                  <div className="text-xs font-medium text-gray-900 p-1">
                    {stop.name}<br />{stop.estimated_time}
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
