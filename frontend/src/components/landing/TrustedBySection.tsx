import { trustedByItems } from '@/data/mockData';

export function TrustedBySection() {
  const doubled = [...trustedByItems, ...trustedByItems];

  return (
    <section className="py-8 bg-light-gray dark:bg-deep-forest/50 overflow-hidden">
      <div className="relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {doubled.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-16 px-8"
            >
              <span className="text-sm font-semibold tracking-[0.15em] uppercase text-text-muted/50 dark:text-white/30 select-none">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
