import { useState, useMemo } from 'react';
import { GoogleMap, MarkerF, HeatmapLayerF, InfoWindowF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface PestOutbreak {
  id: number; lat: number; lng: number;
  pest: string; severity: string; crop: string; village: string;
}

interface PestMapProps {
  outbreaks: PestOutbreak[];
  regionLat: number;
  regionLng: number;
  regionZoom: number;
}

const containerStyle = { width: '100%', height: '100%', borderRadius: '0.5rem' };

const getIcon = (severity: string) => {
  const color = severity === 'Critical' ? '#991b1b' : severity === 'High' ? '#ef4444' : '#f59e0b';
  return {
    path: typeof window !== 'undefined' && window.google ? google.maps.SymbolPath.CIRCLE : 0,
    fillColor: color, fillOpacity: 1, strokeWeight: 2, strokeColor: '#ffffff', scale: 8,
  };
};

export function PestMap({ outbreaks, regionLat, regionLng, regionZoom }: PestMapProps) {
  const { isLoaded } = useGoogleMaps();
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  const heatmapData = useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) return [];
    const points: google.maps.LatLng[] = [];
    outbreaks.forEach(o => {
      const count = o.severity === 'Critical' ? 30 : o.severity === 'High' ? 15 : 5;
      for (let i = 0; i < count; i++) {
        points.push(new window.google.maps.LatLng(
          o.lat + (Math.random() - 0.5) * 0.1,
          o.lng + (Math.random() - 0.5) * 0.1,
        ));
      }
    });
    return points;
  }, [isLoaded, outbreaks]);

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
        <h3 className="text-lg font-semibold text-text-primary dark:text-white">Active Pest Outbreaks</h3>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-900 inline-block" /> Critical</span>
        </div>
      </div>
      <div className="relative flex-1 rounded-xl overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: regionLat, lng: regionLng }}
          zoom={regionZoom + 2}
          options={{ disableDefaultUI: true, zoomControl: true }}
        >
          {heatmapData.length > 0 && (
            <HeatmapLayerF
              data={heatmapData}
              options={{
                radius: 20, opacity: 0.6,
                gradient: [
                  'rgba(0,0,0,0)', 'rgba(255,165,0,1)',
                  'rgba(255,0,0,1)', 'rgba(128,0,128,1)',
                ],
              }}
            />
          )}
          {outbreaks.map(o => (
            <MarkerF key={o.id} position={{ lat: o.lat, lng: o.lng }}
              icon={getIcon(o.severity)} onClick={() => setActiveMarker(o.id)}>
              {activeMarker === o.id && (
                <InfoWindowF position={{ lat: o.lat, lng: o.lng }} onCloseClick={() => setActiveMarker(null)}>
                  <div className="p-2 text-gray-900 text-xs">
                    <p className="font-bold mb-1">{o.pest}</p>
                    <p>Severity: {o.severity}</p>
                    <p>Crop: {o.crop}</p>
                    <p>Village: {o.village}</p>
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
