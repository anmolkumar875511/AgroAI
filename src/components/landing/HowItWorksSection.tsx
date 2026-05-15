import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check } from 'lucide-react';
import { howItWorksSteps } from '@/data/mockData';

gsap.registerPlugin(ScrollTrigger);

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.how-step').forEach((step, i) => {
        gsap.fromTo(
          step,
          { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 75%',
            },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-off-white dark:bg-deep-forest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary dark:text-white">
            How AgroAI Works
          </h2>
          <p className="mt-4 text-base text-text-secondary dark:text-white/60">
            Five rights. One platform. Infinite impact.
          </p>
        </div>

        <div className="space-y-16 lg:space-y-24">
          {howItWorksSteps.map((step, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={step.id}
                className={`how-step relative flex flex-col ${
                  isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } items-center gap-8 lg:gap-16`}
              >
                {/* Number Background */}
                <div className="absolute -top-8 lg:-top-12 text-[100px] lg:text-[140px] font-extrabold text-deep-green/[0.06] dark:text-white/[0.03] leading-none select-none pointer-events-none"
                     style={{ left: isEven ? '0' : 'auto', right: isEven ? 'auto' : '0' }}>
                  {step.number}
                </div>

                {/* Image */}
                <div className="relative w-full lg:w-1/2">
                  <div className="rounded-card overflow-hidden shadow-card-hover">
                    <img src={step.image} alt={step.title} className="w-full h-48 lg:h-72 object-cover" />
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 relative">
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-lime-green">
                    Step {step.number}
                  </span>
                  <h3 className="mt-2 text-2xl lg:text-3xl font-bold text-text-primary dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base text-text-secondary dark:text-white/60 leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {step.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-lime-green/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-lime-green" />
                        </div>
                        <span className="text-sm text-text-secondary dark:text-white/60">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
