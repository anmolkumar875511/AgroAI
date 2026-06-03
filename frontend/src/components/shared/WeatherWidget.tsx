import { Sun, CloudRain, Cloud, Droplets } from 'lucide-react';
import { useRegion } from '@/contexts/RegionContext';

const regionWeatherMap: Record<string, { temp: number; condition: 'sunny' | 'rainy' | 'humid' | 'cloudy'; location: string }> = {
  ind: { location: 'New Delhi', temp: 31, condition: 'cloudy' },
  br: { location: 'Patna', temp: 34, condition: 'sunny' },
  mh: { location: 'Mumbai', temp: 30, condition: 'humid' },
  pb: { location: 'Ludhiana', temp: 35, condition: 'sunny' },
  up: { location: 'Lucknow', temp: 33, condition: 'sunny' },
  gj: { location: 'Ahmedabad', temp: 36, condition: 'sunny' },
  ka: { location: 'Bengaluru', temp: 26, condition: 'rainy' },
};

export function WeatherWidget() {
  const { activeRegion } = useRegion();
  const weather = regionWeatherMap[activeRegion.id] || regionWeatherMap.br;

  const WeatherIcon =
    weather.condition === 'sunny'
      ? Sun
      : weather.condition === 'rainy'
      ? CloudRain
      : weather.condition === 'humid'
      ? Droplets
      : Cloud;

  const iconColor =
    weather.condition === 'sunny'
      ? 'text-accent-yellow'
      : weather.condition === 'rainy'
      ? 'text-info-blue'
      : 'text-text-muted';

  return (
    <div className="flex items-center gap-2 bg-light-gray dark:bg-white/5 px-3 py-1.5 rounded-full">
      <WeatherIcon className={`w-5 h-5 ${iconColor}`} />
      <span className="text-sm font-semibold text-text-primary dark:text-white">
        {weather.temp}°C
      </span>
      <span className="text-xs text-text-muted hidden sm:inline">{weather.location}</span>
    </div>
  );
}

