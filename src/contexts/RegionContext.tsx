import { createContext, useContext, useState, type ReactNode } from 'react';

export type Region = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  territoryId: string;
};

export const regions: Region[] = [
  { id: 'ind', name: 'India (All)', lat: 21.1458, lng: 79.0882, zoom: 5, territoryId: 'TER_0001' },
  { id: 'br', name: 'Bihar', lat: 25.0961, lng: 85.3131, zoom: 7, territoryId: 'TER_0001' },
  { id: 'mh', name: 'Maharashtra', lat: 19.7515, lng: 75.7139, zoom: 6, territoryId: 'TER_0005' },
  { id: 'pb', name: 'Punjab', lat: 31.1471, lng: 75.3412, zoom: 7, territoryId: 'TER_0004' },
  { id: 'up', name: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, zoom: 6, territoryId: 'TER_0001' },
  { id: 'gj', name: 'Gujarat', lat: 22.2587, lng: 71.1924, zoom: 6, territoryId: 'TER_0005' },
  { id: 'ka', name: 'Karnataka', lat: 15.3173, lng: 75.7139, zoom: 6, territoryId: 'TER_0001' },
];

interface RegionContextType {
  activeRegion: Region;
  setActiveRegionId: (id: string) => void;
  regions: Region[];
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [activeRegionId, setActiveRegionId] = useState('br'); // Default to Bihar

  const activeRegion = regions.find((r) => r.id === activeRegionId) || regions[0];

  return (
    <RegionContext.Provider value={{ activeRegion, setActiveRegionId, regions }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
