import { Sun, CloudRain, Cloud, Droplets } from 'lucide-react';
import { weatherData } from '@/data/mockData';

export function WeatherWidget() {
  const WeatherIcon =
    weatherData.condition === 'sunny'
      ? Sun
      : weatherData.condition === 'rainy'
      ? CloudRain
      : weatherData.condition === 'humid'
      ? Droplets
      : Cloud;

  const iconColor =
    weatherData.condition === 'sunny'
      ? 'text-accent-yellow'
      : weatherData.condition === 'rainy'
      ? 'text-info-blue'
      : 'text-text-muted';

  return (
    <div className="flex items-center gap-2 bg-light-gray dark:bg-white/5 px-3 py-1.5 rounded-full">
      <WeatherIcon className={`w-5 h-5 ${iconColor}`} />
      <span className="text-sm font-semibold text-text-primary dark:text-white">
        {weatherData.temp}°C
      </span>
      <span className="text-xs text-text-muted hidden sm:inline">{weatherData.location}</span>
    </div>
  );
}
