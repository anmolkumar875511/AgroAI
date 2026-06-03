import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { CloudSun, Bug, Sprout, BarChart3, Leaf, Play } from 'lucide-react';

export function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.hero-overline', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, 0.2)
        .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, 0.4)
        .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, 0.7)
        .fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 1.0)
        .fromTo('.hero-stats', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 1.2)
        .fromTo('.hero-float-card', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, stagger: 0.15, duration: 0.6 }, 0.8);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const floatingCards = [
    { icon: CloudSun, label: '28°C Sunny', color: 'text-accent-yellow', top: '15%', right: '8%', delay: '0s' },
    { icon: Bug, label: 'Pest Alert', color: 'text-danger-red', top: '30%', right: '3%', delay: '1s' },
    { icon: Sprout, label: 'Crop Healthy', color: 'text-lime-green', top: '50%', right: '10%', delay: '2s' },
    { icon: BarChart3, label: '+12% Revenue', color: 'text-info-blue', top: '65%', right: '4%', delay: '0.5s' },
    { icon: Leaf, label: 'AI Active', color: 'text-deep-green', top: '25%', right: '18%', delay: '1.5s' },
  ];

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/cta-leaf.jpg"
      >
        <source src="/videos/aerial-fields.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-dark-surface/80 via-dark-surface/50 to-dark-surface/30" />

      {/* Floating Cards */}
      {floatingCards.map((card, i) => (
        <div
          key={i}
          className="hero-float-card absolute hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg z-10"
          style={{ top: card.top, right: card.right, animationDelay: card.delay }}
        >
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </div>
          <span className="text-sm font-medium text-white">{card.label}</span>
        </div>
      ))}

      {/* Content */}
      <div ref={contentRef} className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-2xl">
          {/* Overline */}
          <div className="hero-overline flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-lime-green animate-pulse-dot" />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-lime-green">
              Syngenta Hackathon 2026
            </span>
          </div>

          {/* Title */}
          <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            AgroAI —{' '}
            <span className="text-gradient">Farmer First</span>{' '}
            Field Intelligence Platform
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle mt-6 text-lg sm:text-xl text-white/85 leading-relaxed max-w-xl">
            Right Farmer. Right Advice. Right Product. Right Action. Right Time.
          </p>

          {/* CTAs */}
          <div className="hero-cta flex flex-wrap gap-4 mt-10">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 rounded-button gradient-primary text-white font-semibold text-base shadow-card-hover hover:shadow-glow-green hover:brightness-110 transition-all duration-300"
            >
              Launch Dashboard
            </button>
            <a
              href="https://www.youtube.com/watch?v=wE2jA9mDXHI"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-button bg-white/10 backdrop-blur-xl border border-white/25 text-white font-semibold text-base hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              View Demo
            </a>
          </div>

          {/* Stats */}
          <div className="hero-stats flex flex-wrap gap-8 sm:gap-12 mt-16">
            {[
              { value: '15K+', label: 'Active Farmers' },
              { value: '98%', label: 'Recommendation Accuracy' },
              { value: '3x', label: 'Revenue Uplift' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/60 mt-1 font-medium tracking-wide uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
