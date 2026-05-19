import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
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
  { id: 'ndvi', label: 'NDVI' },
  { id: 'weather', label: 'Weather' },
  { id: 'pest', label: 'Pest Map' },
];

export default function RiskAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<TabId>('heatmap');
  const { user } = useAuth();
  const { activeRegion } = useRegion();
  const territoryId = user?.territory_id || 'TER_0001';

  const { data, loading, error } = useApi(
    () => riskAPI.getAll(territoryId, activeRegion.lat, activeRegion.lng),
    [territoryId, activeRegion.lat, activeRegion.lng],
  );

  const regionLat = activeRegion.lat;
  const regionLng = activeRegion.lng;
  const regionZoom = activeRegion.zoom;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#1976D2]">Geo risk intelligence</p>
        <h2 className="text-2xl lg:text-3xl font-bold text-white mt-1">
          Crop Risk Analyzer
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          Operational heatmaps for pest pressure, weather anomalies, and crop health signals.
        </p>
        <div className="mt-4 flex gap-1 border-b border-white/10 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'text-[#8BC34A] border-[#8BC34A]'
                  : 'text-slate-500 border-transparent hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[#D32F2F]/40 bg-[#D32F2F]/10 p-4 text-sm text-[#FFCDD2] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Failed to load risk analyzer: {error}
        </div>
      )}

      {activeTab === 'heatmap' && (
        <div className="relative">
          <HeatmapGrid
            cells={data?.heatmap || []}
            regionLat={regionLat}
            regionLng={regionLng}
            regionZoom={regionZoom}
          />
          <AIInsightsPanel
            insights={data?.ai_insights || []}
            overallRisk={data?.overall_risk_level || (loading ? 'Analyzing' : 'Medium')}
            territoryId={territoryId}
          />
        </div>
      )}

      {activeTab === 'ndvi' && <NDVIPanel data={data?.ndvi_data || []} />}

      {activeTab === 'weather' && (
        <WeatherMap
          anomalies={data?.weather_anomalies || []}
          regionLat={regionLat}
          regionLng={regionLng}
          regionZoom={regionZoom}
        />
      )}

      {activeTab === 'pest' && <PestMap />}
    </div>
  );
}
