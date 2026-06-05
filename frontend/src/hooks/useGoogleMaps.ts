import { useJsApiLoader } from '@react-google-maps/api';

const libraries: ("drawing" | "geometry" | "places" | "visualization")[] = [];

export function useGoogleMaps() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBV24loDaI5LfA3rTTXDMS-fvRCxfgkqnc',
    libraries,
  });

  return { isLoaded, loadError };
}

