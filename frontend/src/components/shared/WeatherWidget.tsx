import { useState, useEffect } from 'react';
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

function getWeatherCondition(code: number): 'sunny' | 'rainy' | 'humid' | 'cloudy' {
  if (code === 0) return 'sunny';
  if ([1, 2, 3].includes(code)) return 'sunny';
  if ([45, 48].includes(code)) return 'humid';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return 'rainy';
  return 'cloudy';
}

export function WeatherWidget() {
  const { activeRegion } = useRegion();
  
  const defaultWeather = regionWeatherMap[activeRegion.id] || regionWeatherMap.br;
  const [weather, setWeather] = useState({
    temp: defaultWeather.temp,
    condition: defaultWeather.condition,
    location: defaultWeather.location,
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${activeRegion.lat}&longitude=${activeRegion.lng}&current_weather=true`
        );
        if (!res.ok) throw new Error('API fetch failed');
        const data = await res.json();
        if (data && data.current_weather) {
          const current = data.current_weather;
          setWeather({
            temp: Math.round(current.temperature),
            condition: getWeatherCondition(current.weathercode),
            location: defaultWeather.location,
          });
        }
      } catch (err) {
        console.error('Error fetching real-time weather:', err);
        setWeather({
          temp: defaultWeather.temp,
          condition: defaultWeather.condition,
          location: defaultWeather.location,
        });
      }
    };

    fetchWeather();
  }, [activeRegion.id, activeRegion.lat, activeRegion.lng, defaultWeather.location, defaultWeather.temp, defaultWeather.condition]);

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
    <div className="flex items-center gap-2 bg-light-gray dark:bg-white/5 px-3 py-1.5 rounded-full transition-all duration-300">
      <WeatherIcon className={`w-5 h-5 ${iconColor}`} />
      <span className="text-sm font-semibold text-text-primary dark:text-white">
        {weather.temp}°C
      </span>
      <span className="text-xs text-text-muted hidden sm:inline">{weather.location}</span>
    </div>
  );
}


