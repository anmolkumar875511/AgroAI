import { useState, useMemo } from 'react';
import { GoogleMap, MarkerF, HeatmapLayerF, InfoWindowF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useTheme } from '@/contexts/ThemeContext';

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

// Custom teardrop Google Maps marker symbol
const getIcon = (severity: string) => {
  // Red for critical, orange for high, yellow for medium/low
  const color = severity === 'Critical' ? '#ef4444' : severity === 'High' ? '#f97316' : '#eab308';
  return {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 1.5,
    strokeColor: '#ffffff',
    scale: 1.5,
    anchor: typeof window !== 'undefined' && window.google ? new window.google.maps.Point(12, 22) : undefined,
  };
};

export function PestMap({ outbreaks, regionLat, regionLng, regionZoom }: PestMapProps) {
  const { isLoaded } = useGoogleMaps();
  const { theme } = useTheme();
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  const mapStyles = theme === 'dark' ? darkMapStyle : lightMapStyle;

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
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Critical</span>
        </div>
      </div>
      <div className="relative flex-1 rounded-xl overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: regionLat, lng: regionLng }}
          zoom={regionZoom + 2}
          options={{ 
            disableDefaultUI: true, 
            zoomControl: true,
            styles: mapStyles
          }}
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
                  <div className="p-2 text-gray-900 text-xs min-w-[130px]">
                    <p className="font-bold text-sm text-deep-green mb-1">{o.pest}</p>
                    <p className="mb-0.5"><span className="text-gray-500 font-medium">Severity:</span> <span className="font-semibold">{o.severity}</span></p>
                    <p className="mb-0.5"><span className="text-gray-500 font-medium">Crop:</span> <span className="font-semibold">{o.crop}</span></p>
                    <p className="mb-0.5"><span className="text-gray-500 font-medium">Village:</span> <span className="font-semibold">{o.village}</span></p>
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
