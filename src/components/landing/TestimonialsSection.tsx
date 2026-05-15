import { useRef } from 'react';
import { Quote } from 'lucide-react';
import { testimonials } from '@/data/mockData';

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-20 lg:py-28 bg-light-gray dark:bg-deep-forest/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary dark:text-white">
            Trusted by Field Teams & Farmers
          </h2>
        </div>

        {/* Horizontal scroll carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="flex-shrink-0 w-[320px] lg:w-[380px] bg-white dark:bg-white/5 rounded-card p-6 lg:p-8 shadow-card snap-center"
            >
              <Quote className="w-8 h-8 text-lime-green/30" />
              <p className="mt-4 text-base text-text-primary dark:text-white/90 italic leading-relaxed">
                "{t.quote}"
              </p>
              <div className="mt-6 flex items-center gap-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-text-primary dark:text-white">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-deep-green/20 dark:bg-white/20" />
          ))}
        </div>
      </div>
    </section>
  );
}
