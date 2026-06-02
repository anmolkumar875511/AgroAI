import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRegion } from '@/contexts/RegionContext';
import { useApi } from '@/hooks/useApi';
import { riskAPI } from '@/api/client';
import { HeatmapGrid } from '@/sections/risk-analyzer/HeatmapGrid';
import { NDVIPanel } from '@/sections/risk-analyzer/NDVIPanel';
import { AIInsightsPanel } from '@/sections/risk-analyzer/AIInsightsPanel';
import { WeatherMap } from '@/sections/risk-analyzer/WeatherMap';
import { PestMap } from '@/sections/risk-analyzer/PestMap';
import { cn } from '@/lib/utils';

type TabId = 'heatmap' | 'ndvi' | 'weather' | 'pest';

const tabs: { id: TabId; label: string }[] = [
  { id: 'heatmap', label: 'Heatmap' },
  { id: 'ndvi',    label: 'NDVI' },
  { id: 'weather', label: 'Weather' },
  { id: 'pest',    label: 'Pest Map' },
];

function RiskAnalyzerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white dark:bg-white/5 rounded-card p-5 border border-transparent dark:border-white/5 h-[400px] flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="h-6 w-32 bg-light-gray dark:bg-white/10 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-light-gray dark:bg-white/10 rounded" />
            <div className="h-8 w-24 bg-light-gray dark:bg-white/10 rounded" />
          </div>
        </div>
        <div className="flex-1 bg-light-gray dark:bg-white/10 rounded-xl my-4" />
      </div>
      <div className="bg-white dark:bg-white/5 rounded-card p-5 border border-transparent dark:border-white/5 h-[200px] flex flex-col justify-between">
        <div className="h-6 w-48 bg-light-gray dark:bg-white/10 rounded" />
        <div className="h-6 w-48 bg-light-gray dark:bg-white/10 rounded" />
        <div className="space-y-2 mt-4">
          <div className="h-4 w-full bg-light-gray dark:bg-white/10 rounded" />
          <div className="h-4 w-[85%] bg-light-gray dark:bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function RiskAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<TabId>('heatmap');
  const { user } = useAuth();
  const territory_id = user?.territory_id || 'TER_0001';
  const { activeRegion } = useRegion();

  const { data, loading, error } = useApi(
    () => riskAPI.getAll(territory_id, activeRegion.lat, activeRegion.lng),
    [territory_id, activeRegion.lat, activeRegion.lng]
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-danger-red bg-white dark:bg-white/5 rounded-card border border-transparent dark:border-white/5 shadow-card">
        <p className="text-base font-semibold">Failed to load Crop Risk Analysis</p>
        <p className="text-xs text-text-muted mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">
          Crop Risk Analyzer
        </h2>
        <div className="mt-4 flex gap-1 border-b border-light-gray dark:border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'text-deep-green dark:text-lime-green border-deep-green dark:border-lime-green'
                  : 'text-text-muted border-transparent hover:text-text-primary dark:hover:text-white',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <RiskAnalyzerSkeleton />
      ) : (() => {
        const mappedHeatmapCells = data.heatmap?.map((cell, index) => {
          const riskMapped = (cell.risk_level.toLowerCase() === 'critical' ? 'critical' : cell.risk_level.toLowerCase()) as 'low' | 'medium' | 'high' | 'critical';
          const y = (cell.lat - activeRegion.lat) / 0.15 + 3;
          const x = (cell.lng - activeRegion.lng) / 0.15 + 4;
          return {
            id: index,
            x,
            y,
            risk: riskMapped,
            village: cell.village,
            risk_percent: Math.round(cell.risk_score),
          };
        }) || [];

        const mappedWeatherAnomalies = data.weather_anomalies?.map((w, index) => {
          const wType = w.type.toLowerCase();
          const typeMapped = wType.includes('rain') ? 'rain' : wType.includes('wind') ? 'wind' : 'drought';
          return {
            id: index,
            lat: w.lat,
            lng: w.lng,
            type: typeMapped,
            label: w.type,
            temp: w.severity === 'High' ? '38°C' : w.severity === 'Medium' ? '32°C' : '26°C',
            condition: w.description,
          };
        }) || [];

        const mappedPestOutbreaks = data.pest_outbreaks?.map((o, index) => {
          return {
            id: index,
            lat: o.lat,
            lng: o.lng,
            pest: o.pest_name,
            severity: o.severity,
            crop: o.crop,
            village: `Cluster ${index + 1}`,
          };
        }) || [];

        return (
          <>
            {activeTab === 'heatmap' && (
              <div className="space-y-4">
                <HeatmapGrid
                  cells={mappedHeatmapCells}
                  regionLat={activeRegion.lat}
                  regionLng={activeRegion.lng}
                  regionZoom={activeRegion.zoom}
                />
                <AIInsightsPanel
                  insights={data.ai_insights || []}
                  overallRisk={data.overall_risk_level || 'Low'}
                  territoryId={territory_id}
                />
              </div>
            )}

            {activeTab === 'ndvi' && (
              <NDVIPanel
                data={data.ndvi_data || []}
              />
            )}

            {activeTab === 'weather' && (
              <WeatherMap
                anomalies={mappedWeatherAnomalies}
                regionLat={activeRegion.lat}
                regionLng={activeRegion.lng}
                regionZoom={activeRegion.zoom}
              />
            )}

            {activeTab === 'pest' && (
              <PestMap
                outbreaks={mappedPestOutbreaks}
                regionLat={activeRegion.lat}
                regionLng={activeRegion.lng}
                regionZoom={activeRegion.zoom}
              />
            )}
          </>
        );
      })()}
    </div>
  );
}
