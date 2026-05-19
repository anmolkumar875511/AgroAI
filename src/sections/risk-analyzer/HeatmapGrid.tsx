// src/sections/risk-analyzer/HeatmapGrid.tsx  — CHANGED
// What changed:
// - Removed: all internal mock data generation
// - Added: cells prop (HeatmapCell[]) passed from RiskAnalyzerPage live API
// - Added: regionLat, regionLng, regionZoom props for Google Maps center
// - Google Map heatmap still uses HeatmapLayerF, points built from cells prop
// - Dropdown selects call parent refetch in future; for now drive crop filter locally

import { useMemo, useState } from 'react';
import { GoogleMap, HeatmapLayerF } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface HeatmapCell {
  id: number; x: number; y: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  village: string; risk_percent: number;
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

export function HeatmapGrid({ cells, regionLat, regionLng, regionZoom }: HeatmapGridProps) {
  const { isLoaded } = useGoogleMaps();
  const [crop, setCrop] = useState('Rice');

  // Build Google Maps heatmap points from cells
  const heatmapData = useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) return [];
    return cells.map(cell => {
      const latOffset = (cell.y - 3) * 0.15;
      const lngOffset = (cell.x - 4) * 0.15;
      return new window.google.maps.LatLng(regionLat + latOffset, regionLng + lngOffset);
    });
  }, [isLoaded, cells, regionLat, regionLng]);

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 overflow-hidden flex flex-col h-[500px]">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-light-gray dark:border-white/10 shrink-0">
        <select value={crop} onChange={e => setCrop(e.target.value)}
          className="px-3 py-2 rounded-button bg-light-gray dark:bg-white/5 text-sm text-text-primary dark:text-white border-none outline-none cursor-pointer">
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
        <div className="ml-auto hidden sm:flex items-center gap-3">
          <span className="text-xs text-text-muted">Risk Level:</span>
          <div className="w-24 h-2 rounded-full bg-gradient-to-r from-lime-green via-accent-yellow to-danger-red" />
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
            options={{ disableDefaultUI: true, zoomControl: true }}
          >
            {heatmapData.length > 0 && (
              <HeatmapLayerF
                data={heatmapData}
                options={{
                  radius: 30, opacity: 0.8,
                  gradient: [
                    'rgba(0,255,255,0)', 'rgba(0,255,255,1)', 'rgba(89,255,0,1)',
                    'rgba(191,255,0,1)', 'rgba(255,255,0,1)', 'rgba(255,191,0,1)',
                    'rgba(255,128,0,1)', 'rgba(255,64,0,1)',  'rgba(255,0,0,1)',
                  ],
                }}
              />
            )}
          </GoogleMap>
        )}

        {/* Fallback grid when cells exist but Maps not loaded */}
        {!isLoaded && cells.length > 0 && (
          <div className="grid grid-cols-8 gap-1 p-2">
            {cells.slice(0, 48).map(cell => (
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