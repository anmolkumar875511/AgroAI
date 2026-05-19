import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GoogleMap, MarkerF, InfoWindowF, Polyline, Circle } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useRegion } from '@/contexts/RegionContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { RouteEfficiencyMetrics } from '@/components/command-center/RouteEfficiencyMetrics';

type MapTab = 'risk' | 'visits' | 'retailers';

const tabs: { id: MapTab; label: string }[] = [
  { id: 'risk', label: 'Risk' },
  { id: 'visits', label: 'Routes' },
  { id: 'retailers', label: 'Retailers' },
];

const containerStyle = { width: '100%', height: '100%' };

const COLORS = {
  riskHigh: '#D32F2F',
  riskMid: '#F9A825',
  opportunity: '#388E3C',
  route: '#1976D2',
};

const getMarkerIcon = (type: MapTab, isActive: boolean) => {
  let color = COLORS.riskHigh;
  if (type === 'visits') color = COLORS.route;
  else if (type === 'retailers') color = COLORS.opportunity;

  const pinPath = 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z';

  return {
    path: pinPath,
    fillColor: color,
    fillOpacity: isActive ? 1 : 0.45,
    strokeWeight: isActive ? 2 : 1,
    strokeColor: '#ffffff',
    scale: isActive ? 1.15 : 0.85,
    anchor: typeof window !== 'undefined' && window.google ? new google.maps.Point(0, 0) : undefined,
  };
};

export function MapWidget() {
  const [activeTab, setActiveTab] = useState<MapTab>('risk');
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const { isLoaded } = useGoogleMaps();
  const { activeRegion } = useRegion();
  const { pestOutbreakSim } = useDemoMode();
  const mapRef = useRef<google.maps.Map | null>(null);
  const heatRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  const center = useMemo(() => ({ lat: activeRegion.lat, lng: activeRegion.lng }), [activeRegion]);

  const mapDots = useMemo(
    () => [
      { id: 1, lat: activeRegion.lat + 0.08, lng: activeRegion.lng + 0.06, type: 'risk' as const, label: 'High pest pressure' },
      { id: 2, lat: activeRegion.lat - 0.12, lng: activeRegion.lng - 0.08, type: 'risk' as const, label: 'Medium risk - humidity' },
      { id: 3, lat: activeRegion.lat + 0.14, lng: activeRegion.lng - 0.1, type: 'visits' as const, label: 'Priority village (glow)' },
      { id: 4, lat: activeRegion.lat - 0.06, lng: activeRegion.lng + 0.12, type: 'visits' as const, label: 'Scheduled stop' },
      { id: 5, lat: activeRegion.lat - 0.18, lng: activeRegion.lng + 0.04, type: 'retailers' as const, label: 'High conversion retailer' },
      { id: 6, lat: activeRegion.lat + 0.05, lng: activeRegion.lng + 0.18, type: 'retailers' as const, label: 'Stock-out risk' },
    ],
    [activeRegion],
  );

  const routePath = useMemo(
    () =>
      mapDots
        .filter((d) => d.type === 'visits' || d.type === 'retailers')
        .map((d) => ({ lat: d.lat, lng: d.lng })),
    [mapDots],
  );

  const zoneCircles = useMemo(() => {
    const intensity = pestOutbreakSim ? 1.25 : 1;
    return [
      { lat: activeRegion.lat + 0.05, lng: activeRegion.lng + 0.02, r: 9000 * intensity, fill: COLORS.riskHigh, label: 'Pest zone' },
      { lat: activeRegion.lat - 0.1, lng: activeRegion.lng - 0.05, r: 12000 * intensity, fill: COLORS.riskMid, label: 'Weather watch' },
      { lat: activeRegion.lat + 0.12, lng: activeRegion.lng - 0.15, r: 8000 * intensity, fill: COLORS.opportunity, label: 'Opportunity belt' },
    ];
  }, [activeRegion, pestOutbreakSim]);

  const [mapReady, setMapReady] = useState(false);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  const onUnmount = useCallback(() => {
    heatRef.current?.setMap(null);
    heatRef.current = null;
    mapRef.current = null;
    setMapReady(false);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !isLoaded || !window.google?.maps?.visualization) return;

    heatRef.current?.setMap(null);

    const pts = mapDots.map((d) => new google.maps.LatLng(d.lat, d.lng));

    heatRef.current = new google.maps.visualization.HeatmapLayer({
      data: pts,
      map,
      radius: pestOutbreakSim ? 48 : 36,
      opacity: pestOutbreakSim ? 0.62 : 0.45,
      gradient: pestOutbreakSim
        ? [
            'rgba(0,0,255,0)',
            'rgba(56,142,60,0.2)',
            'rgba(249,168,37,0.55)',
            'rgba(211,47,47,0.85)',
            'rgba(211,47,47,1)',
          ]
        : [
            'rgba(0,0,255,0)',
            'rgba(25,118,210,0.25)',
            'rgba(249,168,37,0.45)',
            'rgba(211,47,47,0.65)',
            'rgba(211,47,47,0.95)',
          ],
    });

    return () => {
      heatRef.current?.setMap(null);
      heatRef.current = null;
    };
  }, [mapReady, isLoaded, mapDots, pestOutbreakSim]);

  if (!isLoaded) {
    return (
      <div className="rounded-xl border border-[#C8E6C9] bg-white p-6 h-[400px] flex flex-col items-center justify-center gap-3 shadow-sm">
        <div className="text-xs font-medium text-[#1976D2] animate-pulse">Initializing geo intelligence...</div>
        <div className="h-8 w-8 border-2 border-[#1976D2]/30 border-t-[#1976D2] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#1E293B] h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0F172A]/40">
        <div>
          <h3 className="font-semibold text-white text-sm">Territory geo intelligence</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Heatmap - zones - active route</p>
        </div>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors border',
                activeTab === tab.id
                  ? 'text-white bg-[#1976D2]/25 border-[#1976D2]/40'
                  : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-200',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex-1 min-h-[300px] bg-[#0F172A] m-3 rounded-lg overflow-hidden border border-white/10">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={activeRegion.zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
            ],
          }}
        >
          {zoneCircles.map((z, i) => (
            <Circle
              key={i}
              center={{ lat: z.lat, lng: z.lng }}
              radius={z.r}
              options={{
                fillColor: z.fill,
                fillOpacity: 0.12,
                strokeColor: z.fill,
                strokeOpacity: 0.55,
                strokeWeight: 1,
              }}
            />
          ))}

          <Polyline
            path={routePath}
            options={{
              strokeColor: COLORS.route,
              strokeOpacity: 0.92,
              strokeWeight: 3,
              geodesic: true,
            }}
          />

          {mapDots
            .filter((d) => d.id === 3)
            .map((dot) => (
              <Circle
                key={`glow-${dot.id}`}
                center={{ lat: dot.lat, lng: dot.lng }}
                radius={pestOutbreakSim ? 5200 : 3800}
                options={{
                  fillColor: COLORS.route,
                  fillOpacity: 0.08,
                  strokeColor: COLORS.route,
                  strokeOpacity: 0.9,
                  strokeWeight: 2,
                }}
              />
            ))}

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
                  <div className="text-xs font-medium text-slate-900 p-1">{dot.label}</div>
                </InfoWindowF>
              )}
            </MarkerF>
          ))}
        </GoogleMap>

        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-3 px-3 py-2 rounded-lg bg-[#0F172A]/95 border border-white/10 text-[10px] z-10">
          <Legend dot={COLORS.riskHigh} label="High risk" />
          <Legend dot={COLORS.riskMid} label="Medium" />
          <Legend dot={COLORS.opportunity} label="Opportunity" />
          <Legend dot={COLORS.route} label="Active route" />
          {pestOutbreakSim && (
            <span className="ml-auto text-[#D32F2F] font-semibold uppercase tracking-wide animate-pulse">Demo outbreak</span>
          )}
        </div>
      </div>

      <div className="px-3 pb-3">
        <RouteEfficiencyMetrics />
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-400">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dot, boxShadow: `0 0 6px ${dot}88` }} />
      <span>{label}</span>
    </div>
  );
}
