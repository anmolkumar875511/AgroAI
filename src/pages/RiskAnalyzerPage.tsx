import { useState } from 'react';
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">
          Crop Risk Analyzer
        </h2>
        <div className="mt-4 flex gap-1 border-b border-light-gray dark:border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'text-deep-green dark:text-lime-green border-deep-green dark:border-lime-green'
                  : 'text-text-muted border-transparent hover:text-text-primary dark:hover:text-white'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'heatmap' && (
        <div className="relative">
          <HeatmapGrid />
          <AIInsightsPanel />
        </div>
      )}

      {activeTab === 'ndvi' && <NDVIPanel />}

      {activeTab === 'weather' && <WeatherMap />}

      {activeTab === 'pest' && <PestMap />}
    </div>
  );
}
