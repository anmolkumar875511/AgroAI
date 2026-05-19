import { useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useTheme } from '@/contexts/ThemeContext';

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

// Custom teardrop Google Maps marker symbol for weather anomalies
const getIcon = (type: string) => {
  // Red for drought, purple for wind, blue for rain
  const color = type === 'drought' ? '#ef4444' : type === 'wind' ? '#a855f7' : '#3b82f6';
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

export function WeatherMap({ anomalies, regionLat, regionLng, regionZoom }: WeatherMapProps) {
  const { isLoaded } = useGoogleMaps();
  const { theme } = useTheme();
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  const mapStyles = theme === 'dark' ? darkMapStyle : lightMapStyle;

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
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Rain</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Drought</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Wind</span>
        </div>
      </div>
      <div className="relative flex-1 rounded-xl overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: regionLat, lng: regionLng }}
          zoom={regionZoom + 1}
          options={{ 
            disableDefaultUI: true, 
            zoomControl: true,
            styles: mapStyles
          }}
        >
          {anomalies.map(data => (
            <MarkerF key={data.id} position={{ lat: data.lat, lng: data.lng }}
              icon={getIcon(data.type)} onClick={() => setActiveMarker(data.id)}>
              {activeMarker === data.id && (
                <InfoWindowF position={{ lat: data.lat, lng: data.lng }} onCloseClick={() => setActiveMarker(null)}>
                  <div className="p-2 text-gray-900 text-xs min-w-[130px]">
                    <p className="font-bold text-sm text-deep-green mb-1">{data.label}</p>
                    <p className="mb-0.5"><span className="text-gray-500 font-medium">Temp:</span> <span className="font-semibold">{data.temp}</span></p>
                    <p className="mb-0.5"><span className="text-gray-500 font-medium">Condition:</span> <span className="font-semibold">{data.condition}</span></p>
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
