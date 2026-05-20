import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useRegion } from '@/contexts/RegionContext';
import { useTheme } from '@/contexts/ThemeContext';

type MapTab = 'risk' | 'visits' | 'retailers';

const tabs: { id: MapTab; label: string }[] = [
  { id: 'risk',      label: 'Risk' },
  { id: 'visits',    label: 'Visits' },
  { id: 'retailers', label: 'Retailers' },
];

const containerStyle = { width: '100%', height: '100%' };

// Custom SVG teardrop marker path with color styling and correct coordinate anchor
const getMarkerIcon = (type: MapTab, isActive: boolean) => {
  // Red for risk, blue for visits, green for retailers
  let color = '#ef4444';
  if (type === 'visits')    color = '#3b82f6';
  else if (type === 'retailers') color = '#22c55e';

  return {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: color,
    fillOpacity: isActive ? 1 : 0.45,
    strokeWeight: isActive ? 1.8 : 1,
    strokeColor: '#ffffff',
    scale: isActive ? 1.6 : 1.2,
    anchor: typeof window !== 'undefined' && window.google ? new window.google.maps.Point(12, 22) : undefined,
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

export function MapWidget() {
  const [activeTab, setActiveTab] = useState<MapTab>('risk');
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const { isLoaded } = useGoogleMaps();
  const { activeRegion } = useRegion();
  const { theme } = useTheme();

  const mapStyles = theme === 'dark' ? darkMapStyle : lightMapStyle;

  const mapDots = useMemo(() => [
    { id: 1, lat: activeRegion.lat + 0.1,  lng: activeRegion.lng + 0.1,  type: 'risk' as const,      label: 'High Risk Zone' },
    { id: 2, lat: activeRegion.lat - 0.2,  lng: activeRegion.lng - 0.3,  type: 'risk' as const,      label: 'Warning Area' },
    { id: 3, lat: activeRegion.lat + 0.3,  lng: activeRegion.lng - 0.2,  type: 'visits' as const,    label: 'Scheduled Visit' },
    { id: 4, lat: activeRegion.lat - 0.1,  lng: activeRegion.lng + 0.4,  type: 'visits' as const,    label: 'Pending Visit' },
    { id: 5, lat: activeRegion.lat - 0.3,  lng: activeRegion.lng + 0.1,  type: 'retailers' as const, label: 'Main Retailer' },
    { id: 6, lat: activeRegion.lat + 0.2,  lng: activeRegion.lng + 0.3,  type: 'retailers' as const, label: 'Sub-Dealer' },
  ], [activeRegion]);

  if (!isLoaded) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-6 h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-green" />
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/80 dark:bg-[#121b14]/40 rounded-2xl shadow-md border border-white/30 dark:border-white/5 h-full flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray dark:border-white/5 gap-2 flex-wrap">
        <h3 className="font-semibold text-text-primary dark:text-white text-base">Territory Overview</h3>
        <div className="flex gap-1.5 bg-light-gray/60 dark:bg-white/5 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setActiveMarker(null); }}
              className={cn(
                'px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300',
                activeTab === tab.id
                  ? 'text-deep-green dark:text-lime-green bg-white dark:bg-[#18281a] shadow-sm'
                  : 'text-text-muted hover:text-text-primary dark:hover:text-white',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1 min-h-[300px] bg-light-gray/60 dark:bg-[#0b150c]/40 m-4 rounded-2xl overflow-hidden z-0 border border-light-gray dark:border-white/5">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: activeRegion.lat, lng: activeRegion.lng }}
          zoom={activeRegion.zoom}
          options={{ 
            disableDefaultUI: true, 
            zoomControl: true,
            styles: mapStyles
          }}
        >
          {mapDots.map(dot => (
            <MarkerF key={dot.id}
              position={{ lat: dot.lat, lng: dot.lng }}
              icon={getMarkerIcon(dot.type, dot.type === activeTab)}
              onClick={() => setActiveMarker(dot.id)}
            >
              {activeMarker === dot.id && (
                <InfoWindowF position={{ lat: dot.lat, lng: dot.lng }}
                  onCloseClick={() => setActiveMarker(null)}
                  options={{ pixelOffset: new window.google.maps.Size(0, -32) }}>
                  <div className="text-xs font-semibold text-gray-900 p-2 min-w-[140px] text-center bg-white rounded-lg">
                    <span className={cn(
                      "block text-[9px] uppercase tracking-widest font-extrabold mb-1",
                      dot.type === 'risk' ? "text-danger-red" :
                      dot.type === 'visits' ? "text-info-blue" :
                      "text-lime-green"
                    )}>
                      {dot.type}
                    </span>
                    <span className="text-text-primary font-bold text-xs">{dot.label}</span>
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          ))}
        </GoogleMap>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-[#142016]/90 backdrop-blur-md shadow-md border border-white/20 dark:border-white/10 z-10 transition-all">
          {[
            { color: 'bg-red-500 shadow-red-500/50', label: 'Risk' },
            { color: 'bg-blue-500 shadow-blue-500/50',  label: 'Visits' },
            { color: 'bg-green-500 shadow-green-500/50', label: 'Retailers' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${l.color} shadow-sm animate-pulse-slow`} />
              <span className="text-[10px] font-bold tracking-wide text-text-secondary dark:text-white/80 uppercase">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
