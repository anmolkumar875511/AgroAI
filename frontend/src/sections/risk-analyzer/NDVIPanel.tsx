import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';

interface NDVIPoint {
  date: string;
  ndvi: number;
  benchmark: number;
  status: string;
}

interface NDVIPanelProps {
  data: NDVIPoint[];
}

export function NDVIPanel({ data }: NDVIPanelProps) {
  if (!data.length) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5 h-[450px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-green" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 rounded-card shadow-card border border-transparent dark:border-white/5 p-5">
      <h3 className="font-semibold text-text-primary dark:text-white mb-6">
        NDVI Health Indicators — Last 12 Months
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,94,32,0.1)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8B9686' }} axisLine={{ stroke: '#EDF1E8' }} />
          <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: '#8B9686' }} axisLine={{ stroke: '#EDF1E8' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#142818',
              borderColor: 'rgba(255,255,255,0.1)',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '13px',
              boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
              border: 'none',
            }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#8BC34A', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
          <Area type="monotone" dataKey="ndvi" name="Actual NDVI" stroke="#8BC34A" strokeWidth={2} fill="rgba(139,195,74,0.15)" animationDuration={800} />
          <Area type="monotone" dataKey="benchmark" name="Benchmark NDVI" stroke="#FFC107" strokeWidth={1.5} strokeDasharray="3 3" fill="rgba(255,193,7,0.05)" animationDuration={800} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
