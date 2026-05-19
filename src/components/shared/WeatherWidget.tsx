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
      ? 'text-[#F9A825]'
      : weatherData.condition === 'rainy'
      ? 'text-[#1976D2]'
      : 'text-slate-400';

  return (
    <div className="flex items-center gap-2 bg-[#0F172A] border border-white/10 px-4 py-2 rounded-lg">
      <WeatherIcon className={`w-5 h-5 ${iconColor}`} />
      <span className="text-sm font-semibold text-white tabular-nums">
        {weatherData.temp}°C
      </span>
      <span className="text-xs text-slate-500 hidden sm:inline">{weatherData.location}</span>
    </div>
  );
}
