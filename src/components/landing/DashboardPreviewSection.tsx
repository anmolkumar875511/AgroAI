import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AlertTriangle, TrendingUp, MapPin, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const bubbles = [
  { icon: AlertTriangle, text: 'Pest Alert: 3 villages', color: 'text-danger-red', bg: 'bg-danger-red/10', top: '15%', left: '5%' },
  { icon: TrendingUp, text: 'Revenue +12%', color: 'text-lime-green', bg: 'bg-lime-green/10', top: '25%', right: '8%' },
  { icon: MapPin, text: '8 visits today', color: 'text-info-blue', bg: 'bg-info-blue/10', bottom: '20%', left: '10%' },
  { icon: Users, text: '15K+ farmers', color: 'text-deep-green', bg: 'bg-deep-green/10', bottom: '30%', right: '5%' },
];

export function DashboardPreviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dashboard-mockup',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'center center',
            scrub: 1,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-dark-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">Your Command Center</h2>
          <p className="mt-4 text-base text-white/60 max-w-md mx-auto">
            A dashboard designed for clarity, speed, and intelligent action.
          </p>
        </div>

        {/* Mockup */}
        <div className="relative">
          <div className="dashboard-mockup relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img
              src="/images/dashboard-mockup.jpg"
              alt="AgroAI Dashboard"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-surface/40 to-transparent pointer-events-none" />
          </div>

          {/* Floating Bubbles */}
          {bubbles.map((bubble, i) => (
            <div
              key={i}
              className="absolute hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg animate-float"
              style={{
                ...('top' in bubble ? { top: bubble.top } : {}),
                ...('left' in bubble ? { left: bubble.left } : {}),
                ...('right' in bubble ? { right: bubble.right } : {}),
                ...('bottom' in bubble ? { bottom: bubble.bottom } : {}),
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <div className={`w-7 h-7 rounded-lg ${bubble.bg} flex items-center justify-center`}>
                <bubble.icon className={`w-3.5 h-3.5 ${bubble.color}`} />
              </div>
              <span className="text-xs font-semibold text-white">{bubble.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
