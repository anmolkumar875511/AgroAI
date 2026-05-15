import { useMemo, useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useRegion } from '@/contexts/RegionContext';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
};

export function WeatherMap() {
  const { isLoaded } = useGoogleMaps();
  const { activeRegion } = useRegion();
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  const weatherData = useMemo(() => [
    { id: 1, lat: activeRegion.lat + 0.15, lng: activeRegion.lng + 0.1, type: 'rain', label: 'Heavy Rainfall Warning', temp: '28°C', condition: 'Storm' },
    { id: 2, lat: activeRegion.lat - 0.2, lng: activeRegion.lng - 0.25, type: 'drought', label: 'Drought Risk', temp: '38°C', condition: 'Sunny' },
    { id: 3, lat: activeRegion.lat + 0.3, lng: activeRegion.lng - 0.1, type: 'wind', label: 'High Winds', temp: '24°C', condition: 'Windy' },
  ], [activeRegion]);

  const getIcon = (type: string) => {
    let color = '#3b82f6'; // blue (rain)
    if (type === 'drought') color = '#ef4444'; // red
    if (type === 'wind') color = '#a855f7'; // purple

    return {
      path: typeof window !== 'undefined' && window.google ? google.maps.SymbolPath.CIRCLE : 0,
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      scale: 10,
    };
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-light-gray dark:bg-white/5 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-green"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 h-[500px] flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
         <h3 className="text-lg font-semibold text-text-primary dark:text-white">Live Weather Anomalies</h3>
      </div>
      <div className="relative flex-1 rounded-xl overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: activeRegion.lat, lng: activeRegion.lng }}
          zoom={activeRegion.zoom + 1}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {weatherData.map((data) => (
            <MarkerF
              key={data.id}
              position={{ lat: data.lat, lng: data.lng }}
              icon={getIcon(data.type)}
              onClick={() => setActiveMarker(data.id)}
            >
              {activeMarker === data.id && (
                <InfoWindowF
                  position={{ lat: data.lat, lng: data.lng }}
                  onCloseClick={() => setActiveMarker(null)}
                >
                  <div className="p-2 text-gray-900">
                    <p className="font-bold text-sm mb-1">{data.label}</p>
                    <p className="text-xs">Temp: {data.temp}</p>
                    <p className="text-xs">Condition: {data.condition}</p>
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          ))}
        </GoogleMap>
      </div>
    </div>
  );
}
