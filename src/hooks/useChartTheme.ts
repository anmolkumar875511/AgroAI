import { useTheme } from '@/contexts/ThemeContext';

export function useChartTheme() {
  const { isDark } = useTheme();

  return {
    gridStroke: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(27,94,32,0.1)',
    axisStroke: isDark ? 'rgba(255,255,255,0.15)' : '#EDF1E8',
    tickFill: isDark ? 'rgba(255,255,255,0.5)' : '#8B9686',
    tooltipBg: isDark ? '#1A1D18' : '#ffffff',
    tooltipBorder: isDark ? 'rgba(255,255,255,0.1)' : 'none',
    tooltipColor: isDark ? '#fff' : '#333',
    legendColor: isDark ? 'rgba(255,255,255,0.6)' : '#666',
    isDark,
  };
}
