import { useState } from 'react';
import { GoogleMap, RectangleF, InfoWindowF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface HeatmapCell {
  id: number;
  x: number;
  y: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  village: string;
  risk_percent: number;
}

interface HeatmapGridProps {
  cells: HeatmapCell[];
  regionLat: number;
  regionLng: number;
  regionZoom: number;
}

const containerStyle = { width: '100%', height: '100%', borderRadius: '0.5rem' };

const RISK_COLORS: Record<string, string> = {
  critical: 'bg-danger-red/60',
  high:     'bg-accent-yellow/50',
  medium:   'bg-lime-green/40',
  low:      'bg-lime-green/20',
};

const RECTANGLE_OPTIONS = {
  critical: {
    strokeColor: '#ef4444',
    fillColor: '#ef4444',
    fillOpacity: 0.45,
    strokeWeight: 1.5,
    strokeOpacity: 0.8,
  },
  high: {
    strokeColor: '#f97316',
    fillColor: '#f97316',
    fillOpacity: 0.35,
    strokeWeight: 1.5,
    strokeOpacity: 0.8,
  },
  medium: {
    strokeColor: '#eab308',
    fillColor: '#eab308',
    fillOpacity: 0.25,
    strokeWeight: 1.5,
    strokeOpacity: 0.7,
  },
  low: {
    strokeColor: '#22c55e',
    fillColor: '#22c55e',
    fillOpacity: 0.15,
    strokeWeight: 1.2,
    strokeOpacity: 0.6,
  },
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

export function HeatmapGrid({ cells, regionLat, regionLng, regionZoom }: HeatmapGridProps) {
  const { isLoaded } = useGoogleMaps();
  const { theme } = useTheme();
  const [crop, setCrop] = useState('Rice');
  const [riskFilter, setRiskFilter] = useState('All');
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  const filteredCells = cells.filter(cell => {
    if (riskFilter === 'Critical') return cell.risk === 'critical';
    if (riskFilter === 'High+') return cell.risk === 'critical' || cell.risk === 'high';
    return true;
  });

  const mapStyles = theme === 'dark' ? darkMapStyle : lightMapStyle;

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 overflow-hidden flex flex-col h-[500px]">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-light-gray dark:border-white/10 shrink-0">
        <select value={crop} onChange={e => setCrop(e.target.value)}
          className="px-3 py-2 rounded-button bg-light-gray dark:bg-white/5 text-sm text-text-primary dark:text-white border-none outline-none cursor-pointer">
          <option value="Rice">Crop: Rice</option>
          <option value="Cotton">Crop: Cotton</option>
          <option value="Wheat">Crop: Wheat</option>
        </select>
        <select className="px-3 py-2 rounded-button bg-light-gray dark:bg-white/5 text-sm text-text-primary dark:text-white border-none outline-none cursor-pointer">
          <option value="7">Date: Last 7 days</option>
          <option value="30">Date: Last 30 days</option>
        </select>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}
          className="px-3 py-2 rounded-button bg-light-gray dark:bg-white/5 text-sm text-text-primary dark:text-white border-none outline-none cursor-pointer">
          <option value="All">Risk: All</option>
          <option value="High+">Risk: High+</option>
          <option value="Critical">Risk: Critical</option>
        </select>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-text-muted uppercase">Risk:</span>
          <div className="flex gap-2 items-center flex-wrap">
            <span className="flex items-center gap-1 text-[10px] font-bold text-text-secondary"><span className="w-2 h-2 rounded bg-[#22c55e] inline-block" /> Low</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-text-secondary"><span className="w-2 h-2 rounded bg-[#eab308] inline-block" /> Med</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-text-secondary"><span className="w-2 h-2 rounded bg-[#f97316] inline-block" /> High</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-text-secondary"><span className="w-2 h-2 rounded bg-[#ef4444] inline-block" /> Crit</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative p-4 flex-1">
        {!isLoaded ? (
          <div className="w-full h-full flex items-center justify-center bg-light-gray dark:bg-white/5 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-green" />
          </div>
        ) : (
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
            {filteredCells.map(cell => {
              // Calculate center latitude and longitude offsets based on cell coords
              const lat = regionLat + (cell.y - 3) * 0.15;
              const lng = regionLng + (cell.x - 4) * 0.15;
              const options = RECTANGLE_OPTIONS[cell.risk];
              return (
                <RectangleF
                  key={cell.id}
                  bounds={{
                    north: lat + 0.075,
                    south: lat - 0.075,
                    east: lng + 0.075,
                    west: lng - 0.075
                  }}
                  options={options}
                  onClick={() => setSelectedCell(cell)}
                />
              );
            })}

            {selectedCell && (
              <InfoWindowF
                position={{
                  lat: regionLat + (selectedCell.y - 3) * 0.15,
                  lng: regionLng + (selectedCell.x - 4) * 0.15
                }}
                onCloseClick={() => setSelectedCell(null)}
              >
                <div className="p-3 text-gray-900 text-xs min-w-[170px] bg-white rounded-md shadow-lg">
                  <div className="flex items-center justify-between mb-1.5 border-b pb-1">
                    <span className="font-bold text-sm text-deep-green">{selectedCell.village}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                      selectedCell.risk === 'critical' ? "bg-red-100 text-red-700" :
                      selectedCell.risk === 'high' ? "bg-orange-100 text-orange-700" :
                      selectedCell.risk === 'medium' ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-700"
                    )}>
                      {selectedCell.risk}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p><span className="text-gray-500">Risk Percent:</span> <span className="font-semibold">{selectedCell.risk_percent}%</span></p>
                    <p><span className="text-gray-500">Crop Focus:</span> <span className="font-semibold">{crop}</span></p>
                    <p><span className="text-gray-500">Alert level:</span> <span className="font-semibold">{
                      selectedCell.risk === 'critical' ? 'Urgent action required' :
                      selectedCell.risk === 'high' ? 'High risk advisory' :
                      selectedCell.risk === 'medium' ? 'Monitor crop health' :
                      'Normal crop metrics'
                    }</span></p>
                  </div>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        )}

        {/* Fallback grid when cells exist but Maps not loaded */}
        {!isLoaded && filteredCells.length > 0 && (
          <div className="grid grid-cols-8 gap-1 p-2">
            {filteredCells.slice(0, 48).map(cell => (
              <div key={cell.id}
                className={`h-8 rounded-sm ${RISK_COLORS[cell.risk]} transition-all duration-500 cursor-pointer`}
                title={`${cell.village}: ${cell.risk_percent}%`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
