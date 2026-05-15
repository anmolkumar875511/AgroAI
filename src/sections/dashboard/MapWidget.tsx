import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useRegion } from '@/contexts/RegionContext';

type MapTab = 'risk' | 'visits' | 'retailers';

const tabs: { id: MapTab; label: string }[] = [
  { id: 'risk', label: 'Risk' },
  { id: 'visits', label: 'Visits' },
  { id: 'retailers', label: 'Retailers' },
];

const containerStyle = {
  width: '100%',
  height: '100%'
};

const getMarkerIcon = (type: MapTab, isActive: boolean) => {
  let color = '#FF3B30'; // danger-red
  if (type === 'visits') color = '#007AFF'; // info-blue
  else if (type === 'retailers') color = '#34C759'; // lime-green

  // Standard map pin shape with tip at 0,0
  const pinPath = 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z';

  return {
    path: pinPath,
    fillColor: color,
    fillOpacity: isActive ? 1 : 0.4,
    strokeWeight: isActive ? 2 : 1,
    strokeColor: '#ffffff',
    scale: isActive ? 1.1 : 0.8,
    anchor: typeof window !== 'undefined' && window.google ? new google.maps.Point(0, 0) : undefined,
  };
};

export function MapWidget() {
  const [activeTab, setActiveTab] = useState<MapTab>('risk');
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const { isLoaded } = useGoogleMaps();
  const { activeRegion } = useRegion();

  const mapDots = useMemo(() => [
    { id: 1, lat: activeRegion.lat + 0.1, lng: activeRegion.lng + 0.1, type: 'risk' as const, label: 'High Risk Zone' },
    { id: 2, lat: activeRegion.lat - 0.2, lng: activeRegion.lng - 0.3, type: 'risk' as const, label: 'Warning Area' },
    { id: 3, lat: activeRegion.lat + 0.3, lng: activeRegion.lng - 0.2, type: 'visits' as const, label: 'Scheduled Visit' },
    { id: 4, lat: activeRegion.lat - 0.1, lng: activeRegion.lng + 0.4, type: 'visits' as const, label: 'Pending Visit' },
    { id: 5, lat: activeRegion.lat - 0.3, lng: activeRegion.lng + 0.1, type: 'retailers' as const, label: 'Main Retailer' },
    { id: 6, lat: activeRegion.lat + 0.2, lng: activeRegion.lng + 0.3, type: 'retailers' as const, label: 'Sub-Dealer' },
  ], [activeRegion]);

  if (!isLoaded) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-6 h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-green"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray dark:border-white/10">
        <h3 className="font-semibold text-text-primary dark:text-white">Territory Overview</h3>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                activeTab === tab.id
                  ? 'text-deep-green dark:text-lime-green bg-deep-green/10 dark:bg-lime-green/10'
                  : 'text-text-muted hover:text-text-primary dark:hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="relative flex-1 min-h-[300px] bg-light-gray dark:bg-white/5 m-4 rounded-xl overflow-hidden z-0">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: activeRegion.lat, lng: activeRegion.lng }}
          zoom={activeRegion.zoom}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapId: 'DEMO_MAP_ID', // Optional: for advanced styling if configured
          }}
        >
          {mapDots.map((dot) => (
            <MarkerF
              key={dot.id}
              position={{ lat: dot.lat, lng: dot.lng }}
              icon={getMarkerIcon(dot.type, dot.type === activeTab)}
              onClick={() => setActiveMarker(dot.id)}
            >
              {activeMarker === dot.id && (
                <InfoWindowF
                  position={{ lat: dot.lat, lng: dot.lng }}
                  onCloseClick={() => setActiveMarker(null)}
                  options={{ pixelOffset: new window.google.maps.Size(0, -10) }}
                >
                  <div className="text-xs font-medium text-gray-900 p-1">
                    {dot.label}
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          ))}
        </GoogleMap>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-4 px-4 py-2 rounded-full bg-white/90 dark:bg-[#1A1D18]/90 backdrop-blur-sm shadow-sm z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-danger-red" />
            <span className="text-[10px] text-text-muted">Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-info-blue" />
            <span className="text-[10px] text-text-muted">Visits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-lime-green" />
            <span className="text-[10px] text-text-muted">Retailers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
