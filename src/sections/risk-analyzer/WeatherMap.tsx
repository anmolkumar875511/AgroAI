// src/sections/risk-analyzer/WeatherMap.tsx  — CHANGED
// What changed:
// - Removed: internal useMemo generating mock weatherData
// - Added: anomalies, regionLat, regionLng, regionZoom props from RiskAnalyzerPage

import { useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface WeatherAnomaly {
  id: number; lat: number; lng: number;
  type: string; label: string; temp: string; condition: string;
}

interface WeatherMapProps {
  anomalies: WeatherAnomaly[];
  regionLat: number;
  regionLng: number;
  regionZoom: number;
}

const containerStyle = { width: '100%', height: '100%', borderRadius: '0.5rem' };

const getIcon = (type: string) => {
  const color = type === 'drought' ? '#ef4444' : type === 'wind' ? '#a855f7' : '#3b82f6';
  return {
    path: typeof window !== 'undefined' && window.google ? google.maps.SymbolPath.CIRCLE : 0,
    fillColor: color, fillOpacity: 1, strokeWeight: 2, strokeColor: '#ffffff', scale: 10,
  };
};

export function WeatherMap({ anomalies, regionLat, regionLng, regionZoom }: WeatherMapProps) {
  const { isLoaded } = useGoogleMaps();
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  if (!isLoaded) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-green" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 h-[500px] flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-text-primary dark:text-white">Live Weather Anomalies</h3>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Rain</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Drought</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Wind</span>
        </div>
      </div>
      <div className="relative flex-1 rounded-xl overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: regionLat, lng: regionLng }}
          zoom={regionZoom + 1}
          options={{ disableDefaultUI: true, zoomControl: true }}
        >
          {anomalies.map(data => (
            <MarkerF key={data.id} position={{ lat: data.lat, lng: data.lng }}
              icon={getIcon(data.type)} onClick={() => setActiveMarker(data.id)}>
              {activeMarker === data.id && (
                <InfoWindowF position={{ lat: data.lat, lng: data.lng }} onCloseClick={() => setActiveMarker(null)}>
                  <div className="p-2 text-gray-900 text-xs">
                    <p className="font-bold mb-1">{data.label}</p>
                    <p>Temp: {data.temp}</p>
                    <p>Condition: {data.condition}</p>
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