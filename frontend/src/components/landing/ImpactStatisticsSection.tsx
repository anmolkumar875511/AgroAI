import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CountUp from 'react-countup';
import { TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 15420, suffix: '', prefix: '', label: 'Farmers Onboarded', trend: '+23% this quarter' },
  { value: 97.8, suffix: '%', prefix: '', label: 'AI Recommendation Accuracy', trend: '+4.2% improvement', decimals: 1 },
  { value: 3.2, suffix: 'x', prefix: '', label: 'Average Revenue Uplift', trend: 'vs traditional methods', decimals: 1 },
  { value: 48, suffix: 'hrs', prefix: '', label: 'Average Response Time', trend: '-60% from baseline' },
];

export function ImpactStatisticsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => setInView(true),
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/farmer-sunita.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-dark-surface/75" />
      </div>

      {/* Topographic Lines - SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" preserveAspectRatio="none"
           viewBox="0 0 1200 500">
        {['M0,100 Q300,60 600,100 T1200,100',
          'M0,180 Q300,220 600,180 T1200,180',
          'M0,260 Q300,220 600,260 T1200,260',
          'M0,340 Q300,380 600,340 T1200,340',
          'M0,420 Q300,380 600,420 T1200,420'
        ].map((d, i) => (
          <path key={i} d={d} fill="none" stroke="white" strokeWidth="1" className="animate-pulse"
                style={{ animationDelay: `${i * 0.3}s`, animationDuration: '4s' }} />
        ))}
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-16">
          Measurable Impact, Real Results
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-card p-6 lg:p-8 text-center">
              <div className="text-3xl lg:text-4xl font-extrabold text-white">
                {inView ? (
                  <CountUp end={stat.value} duration={2} decimals={stat.decimals || 0} prefix={stat.prefix} suffix={stat.suffix} />
                ) : `0${stat.suffix}`}
              </div>
              <div className="mt-2 text-xs lg:text-sm text-white/70 font-medium uppercase tracking-wide">
                {stat.label}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3 text-lime-green" />
                <span className="text-xs text-lime-green font-medium">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
