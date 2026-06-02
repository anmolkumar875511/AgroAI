import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, ShieldAlert, MapPin } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

gsap.registerPlugin(ScrollTrigger);

const chartData = [
  { v: 20 }, { v: 35 }, { v: 28 }, { v: 45 }, { v: 38 }, { v: 55 }, { v: 48 }, { v: 62 },
];

const heatmapGrid = Array.from({ length: 48 }, (_, i) => {
  const r = Math.random();
  return { id: i, intensity: r > 0.8 ? 'bg-danger-red/60' : r > 0.6 ? 'bg-accent-yellow/50' : r > 0.3 ? 'bg-lime-green/40' : 'bg-lime-green/20' };
});

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Brain,
      iconGradient: 'from-deep-green to-lime-green',
      title: 'Explainable AI Recommendations',
      description: 'Every recommendation comes with a "Why" \u2014 weather patterns, historical data, inventory levels, and demand forecasting explained in simple language.',
      visual: (
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <defs>
              <linearGradient id="featChart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1B5E20" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#1B5E20" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="#1B5E20" strokeWidth={2} fill="url(#featChart)" />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
    {
      icon: ShieldAlert,
      iconGradient: 'from-danger-red to-accent-yellow',
      title: 'Predictive Risk Analysis',
      description: 'NDVI-based crop health monitoring, pest outbreak prediction, and weather risk scoring \u2014 all visualized on interactive heatmaps with satellite imagery feel.',
      visual: (
        <div className="grid grid-cols-8 gap-1">
          {heatmapGrid.map((cell) => (
            <div key={cell.id} className={`h-3 rounded-sm ${cell.intensity} transition-all duration-500`} />
          ))}
        </div>
      ),
    },
    {
      icon: MapPin,
      iconGradient: 'from-info-blue to-lime-green',
      title: 'AI-Optimized Visit Planning',
      description: 'Priority-ranked visit schedules with AI-calculated scores, route optimization, and real-time traffic and weather-aware rescheduling.',
      visual: (
        <svg viewBox="0 0 280 60" className="w-full h-16">
          <path d="M20,40 Q70,10 100,30 T180,20 T260,35" fill="none" stroke="#1B5E20" strokeWidth="2" strokeLinecap="round" strokeDasharray="4,4">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
          </path>
          {[20, 100, 180, 260].map((cx, i) => (
            <g key={i}>
              <circle cx={cx} cy={[40, 30, 20, 35][i]} r="6" fill={i === 0 ? '#8BC34A' : i === 3 ? '#1B5E20' : '#FFC107'} stroke="white" strokeWidth="2" />
              <text x={cx} y={[40, 30, 20, 35][i] + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">{i + 1}</text>
            </g>
          ))}
        </svg>
      ),
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-off-white dark:bg-deep-forest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary dark:text-white">
            AI-Powered Field Intelligence
          </h2>
          <p className="mt-4 text-base text-text-secondary dark:text-white/60 max-w-xl mx-auto">
            Every insight is calculated, every recommendation is explainable, every action is timed to perfection.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="feature-card group relative bg-white dark:bg-white/5 rounded-card p-8 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 border border-transparent dark:border-white/5"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.iconGradient} flex items-center justify-center mb-6`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text-primary dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary dark:text-white/60 leading-relaxed mb-6">
                {feature.description}
              </p>
              <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                {feature.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
