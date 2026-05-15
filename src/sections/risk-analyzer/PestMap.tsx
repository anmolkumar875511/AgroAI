import { useMemo, useState } from 'react';
import { GoogleMap, MarkerF, HeatmapLayerF, InfoWindowF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useRegion } from '@/contexts/RegionContext';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
};

export function PestMap() {
  const { isLoaded } = useGoogleMaps();
  const { activeRegion } = useRegion();
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  const pestOutbreaks = useMemo(() => [
    { id: 1, lat: activeRegion.lat + 0.05, lng: activeRegion.lng + 0.15, pest: 'Fall Armyworm', severity: 'High', crop: 'Maize' },
    { id: 2, lat: activeRegion.lat - 0.15, lng: activeRegion.lng - 0.1, pest: 'Locust', severity: 'Critical', crop: 'Wheat' },
    { id: 3, lat: activeRegion.lat + 0.2, lng: activeRegion.lng - 0.3, pest: 'Aphids', severity: 'Medium', crop: 'Cotton' },
  ], [activeRegion]);

  const heatmapData = useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) return [];
    
    const points: google.maps.LatLng[] = [];
    pestOutbreaks.forEach((outbreak) => {
      // Add cluster of points around the outbreak to create a heat blob
      const pointCount = outbreak.severity === 'Critical' ? 30 : outbreak.severity === 'High' ? 15 : 5;
      for (let i = 0; i < pointCount; i++) {
        const latOffset = (Math.random() - 0.5) * 0.1;
        const lngOffset = (Math.random() - 0.5) * 0.1;
        points.push(new window.google.maps.LatLng(outbreak.lat + latOffset, outbreak.lng + lngOffset));
      }
    });
    return points;
  }, [isLoaded, pestOutbreaks]);

  const getIcon = (severity: string) => {
    let color = '#f59e0b'; // amber
    if (severity === 'High') color = '#ef4444'; // red
    if (severity === 'Critical') color = '#991b1b'; // dark red

    return {
      path: typeof window !== 'undefined' && window.google ? google.maps.SymbolPath.CIRCLE : 0,
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      scale: 8,
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
         <h3 className="text-lg font-semibold text-text-primary dark:text-white">Active Pest Outbreaks</h3>
      </div>
      <div className="relative flex-1 rounded-xl overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: activeRegion.lat, lng: activeRegion.lng }}
          zoom={activeRegion.zoom + 2}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {heatmapData.length > 0 && (
            <HeatmapLayerF
              data={heatmapData}
              options={{
                radius: 20,
                opacity: 0.6,
                gradient: [
                  'rgba(0, 0, 0, 0)',
                  'rgba(255, 165, 0, 1)', // orange
                  'rgba(255, 0, 0, 1)',   // red
                  'rgba(128, 0, 128, 1)'  // purple
                ]
              }}
            />
          )}

          {pestOutbreaks.map((outbreak) => (
            <MarkerF
              key={outbreak.id}
              position={{ lat: outbreak.lat, lng: outbreak.lng }}
              icon={getIcon(outbreak.severity)}
              onClick={() => setActiveMarker(outbreak.id)}
            >
              {activeMarker === outbreak.id && (
                <InfoWindowF
                  position={{ lat: outbreak.lat, lng: outbreak.lng }}
                  onCloseClick={() => setActiveMarker(null)}
                >
                  <div className="p-2 text-gray-900">
                    <p className="font-bold text-sm mb-1">{outbreak.pest}</p>
                    <p className="text-xs">Severity: {outbreak.severity}</p>
                    <p className="text-xs">Affected Crop: {outbreak.crop}</p>
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
