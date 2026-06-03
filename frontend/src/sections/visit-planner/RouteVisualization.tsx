import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  GoogleMap,
  MarkerF,
  PolylineF,
  InfoWindowF,
} from '@react-google-maps/api';

import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useRegion } from '@/contexts/RegionContext';
import { useApi } from '@/hooks/useApi';
import { visitPlannerAPI } from '@/api/client';
import { useTheme } from '@/contexts/ThemeContext';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const polylineOptions = {
  strokeColor: '#34C759',
  strokeOpacity: 0.85,
  strokeWeight: 5,
};

interface RouteVisualizationProps {
  territoryId: string;
}

const getMarkerIcon = () => ({
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  fillColor: '#22c55e',
  fillOpacity: 1,
  strokeWeight: 2,
  strokeColor: '#ffffff',
  scale: 1.4,
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0B150C' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#748875' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1E3520' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#070E08' }] },
];

const lightMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#f5f7f5' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4f6350' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9dfcb' }] },
];

export function RouteVisualization({
  territoryId,
}: RouteVisualizationProps) {
  const [activeStop, setActiveStop] = useState<string | null>(null);

  const { isLoaded } = useGoogleMaps();
  const { activeRegion } = useRegion();
  const { theme } = useTheme();

  const { data: routeData, loading, refetch } = useApi(
    () => visitPlannerAPI.getRoute(territoryId),
    [territoryId],
  );

  const stops = routeData?.stops ?? [];

  const path = useMemo(
    () =>
      stops.map((stop) => ({
        lat: stop.lat,
        lng: stop.lng,
      })),
    [stops],
  );

  const mapStyles =
    theme === 'dark'
      ? darkMapStyle
      : lightMapStyle;

  if (!isLoaded || loading) {
    return (
      <div className="bg-white dark:bg-[#1A1D18] rounded-card shadow-card border border-light-gray dark:border-white/5 p-6 h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-green" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray dark:border-white/10">
        <h4 className="font-semibold text-text-primary dark:text-white">
          Optimized Route
        </h4>

        <span className="text-xs text-text-muted">
          {stops.length} stops ·{' '}
          {routeData?.total_km ?? 0} km ·{' '}
          {routeData?.total_time_min ?? 0} min
        </span>
      </div>

      <div className="relative h-[300px] bg-light-gray dark:bg-white/5 m-4 rounded-xl overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{
            lat: activeRegion.lat,
            lng: activeRegion.lng,
          }}
          zoom={activeRegion.zoom + 1}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: mapStyles,
          }}
        >
          {path.length > 1 && (
            <PolylineF
              path={path}
              options={polylineOptions}
            />
          )}

          {stops.map((stop) => (
            <MarkerF
              key={stop.retailer_id}
              position={{
                lat: stop.lat,
                lng: stop.lng,
              }}
              icon={getMarkerIcon()}
              label={{
                text: String(stop.order),
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 'bold',
              }}
              onClick={() =>
                setActiveStop(stop.retailer_id)
              }
            >
              {activeStop === stop.retailer_id && (
                <InfoWindowF
                  position={{
                    lat: stop.lat,
                    lng: stop.lng,
                  }}
                  onCloseClick={() =>
                    setActiveStop(null)
                  }
                >
                  <div className="text-xs font-medium text-gray-900 p-1">
                    <div>{stop.name}</div>
                    <div>{stop.location}</div>
                    <div>
                      ETA: {stop.estimated_time}
                    </div>
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          ))}
        </GoogleMap>

        <button
          onClick={refetch}
          disabled={loading}
          className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 rounded-button bg-white dark:bg-[#1A1D18] shadow-dropdown text-sm font-medium text-text-primary dark:text-white hover:bg-light-gray transition-colors z-10 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Recalculate
        </button>
      </div>
    </div>
  );
}