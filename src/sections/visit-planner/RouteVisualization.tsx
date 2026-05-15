import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { GoogleMap, MarkerF, PolylineF, InfoWindowF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useRegion } from '@/contexts/RegionContext';

const polylineOptions = {
  strokeColor: '#34C759', // lime-green
  strokeOpacity: 0.8,
  strokeWeight: 4,
};

const getMarkerIcon = (status: 'completed' | 'in-progress' | 'pending') => {
  let color = '#FFCC00'; // pending
  if (status === 'completed') color = '#34C759';
  else if (status === 'in-progress') color = '#007AFF';

  return {
    path: typeof window !== 'undefined' && window.google ? google.maps.SymbolPath.CIRCLE : 0,
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#ffffff',
    scale: 10,
  };
};

const containerStyle = {
  width: '100%',
  height: '100%'
};

export function RouteVisualization() {
  const [activeStop, setActiveStop] = useState<number | null>(null);
  const { isLoaded } = useGoogleMaps();
  const { activeRegion } = useRegion();

  const stops = useMemo(() => [
    { id: 1, name: 'Sonepur Block', lat: activeRegion.lat + 0.1, lng: activeRegion.lng + 0.1, status: 'completed' as const, time: '09:00 AM' },
    { id: 2, name: 'Digha Village', lat: activeRegion.lat - 0.05, lng: activeRegion.lng + 0.2, status: 'in-progress' as const, time: '11:30 AM' },
    { id: 3, name: 'Maner Farm', lat: activeRegion.lat - 0.2, lng: activeRegion.lng + 0.05, status: 'pending' as const, time: '02:00 PM' },
    { id: 4, name: 'Bihta Center', lat: activeRegion.lat - 0.1, lng: activeRegion.lng - 0.15, status: 'pending' as const, time: '04:30 PM' },
  ], [activeRegion]);

  const path = useMemo(() => stops.map(stop => ({ lat: stop.lat, lng: stop.lng })), [stops]);

  if (!isLoaded) {
    return (
      <div className="bg-white dark:bg-[#1A1D18] rounded-card shadow-card border border-light-gray dark:border-white/5 p-6 h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-green"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray dark:border-white/10">
        <h4 className="font-semibold text-text-primary dark:text-white">Optimized Route</h4>
        <span className="text-xs text-text-muted">4 stops | 28km | 3.5hrs</span>
      </div>

      {/* Map */}
      <div className="relative h-[300px] bg-light-gray dark:bg-white/5 m-4 rounded-xl overflow-hidden z-0">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{ lat: activeRegion.lat, lng: activeRegion.lng }}
            zoom={activeRegion.zoom + 1}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            <PolylineF path={path} options={polylineOptions} />

            {stops.map((stop) => (
              <MarkerF
                key={stop.id}
                position={{ lat: stop.lat, lng: stop.lng }}
                icon={getMarkerIcon(stop.status)}
                label={{
                  text: String(stop.id),
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                onClick={() => setActiveStop(stop.id)}
              >
                {activeStop === stop.id && (
                  <InfoWindowF
                    position={{ lat: stop.lat, lng: stop.lng }}
                    onCloseClick={() => setActiveStop(null)}
                  >
                    <div className="text-xs font-medium text-gray-900 p-1">
                      {stop.name}
                    </div>
                  </InfoWindowF>
                )}
              </MarkerF>
            ))}
          </GoogleMap>

        {/* Recalculate Button */}
        <button className="absolute bottom-3 right-3 flex items-center gap-2 px-4 py-2 rounded-button bg-white dark:bg-[#1A1D18] shadow-dropdown text-sm font-medium text-text-primary dark:text-white hover:bg-light-gray transition-colors z-10">
          <RefreshCw className="w-4 h-4" />
          Recalculate
        </button>
      </div>
    </div>
  );
}
