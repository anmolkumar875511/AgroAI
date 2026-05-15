import { useMemo } from 'react';
import { GoogleMap, HeatmapLayerF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useRegion } from '@/contexts/RegionContext';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem'
};

export function HeatmapGrid() {
  const { isLoaded } = useGoogleMaps();
  const { activeRegion } = useRegion();

  // Generate mock heatmap points around the active region
  const heatmapData = useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) return [];
    
    const points: google.maps.LatLng[] = [];
    // Generate some random clustered points around the active region
    for (let i = 0; i < 50; i++) {
      const latOffset = (Math.random() - 0.5) * 2;
      const lngOffset = (Math.random() - 0.5) * 2;
      points.push(new window.google.maps.LatLng(activeRegion.lat + latOffset, activeRegion.lng + lngOffset));
    }
    return points;
  }, [isLoaded, activeRegion]);

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 overflow-hidden flex flex-col h-[500px]">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-light-gray dark:border-white/10 shrink-0">
        <select className="px-3 py-2 rounded-button bg-light-gray dark:bg-white/5 text-sm text-text-primary dark:text-white border-none outline-none cursor-pointer">
          <option>Crop: Rice</option>
          <option>Crop: Cotton</option>
          <option>Crop: Wheat</option>
        </select>
        <select className="px-3 py-2 rounded-button bg-light-gray dark:bg-white/5 text-sm text-text-primary dark:text-white border-none outline-none cursor-pointer">
          <option>Date: Last 7 days</option>
          <option>Date: Last 30 days</option>
        </select>
        <select className="px-3 py-2 rounded-button bg-light-gray dark:bg-white/5 text-sm text-text-primary dark:text-white border-none outline-none cursor-pointer">
          <option>Risk: All</option>
          <option>Risk: High+</option>
          <option>Risk: Critical</option>
        </select>

        {/* Legend */}
        <div className="ml-auto flex items-center gap-3 hidden sm:flex">
          <span className="text-xs text-text-muted">Risk Level:</span>
          <div className="w-24 h-2 rounded-full bg-gradient-to-r from-lime-green via-accent-yellow via-orange-500 to-danger-red" />
        </div>
      </div>

      {/* Grid / Map */}
      <div className="relative p-4 flex-1">
        {!isLoaded ? (
          <div className="w-full h-full flex items-center justify-center bg-light-gray dark:bg-white/5 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-green"></div>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{ lat: activeRegion.lat, lng: activeRegion.lng }}
            zoom={activeRegion.zoom + 1}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            {heatmapData.length > 0 && (
              <HeatmapLayerF
                data={heatmapData}
                options={{
                  radius: 30,
                  opacity: 0.8,
                  gradient: [
                    'rgba(0, 255, 255, 0)',
                    'rgba(0, 255, 255, 1)',
                    'rgba(89, 255, 0, 1)',
                    'rgba(191, 255, 0, 1)',
                    'rgba(255, 255, 0, 1)',
                    'rgba(255, 191, 0, 1)',
                    'rgba(255, 128, 0, 1)',
                    'rgba(255, 64, 0, 1)',
                    'rgba(255, 0, 0, 1)',
                  ]
                }}
              />
            )}
          </GoogleMap>
        )}
      </div>
    </div>
  );
}
