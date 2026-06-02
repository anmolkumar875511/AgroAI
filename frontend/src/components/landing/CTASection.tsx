import { useNavigate } from 'react-router-dom';

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/cta-leaf.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-dark-surface/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6">
        <h2 className="text-3xl lg:text-5xl font-bold text-white">
          Ready to Transform Agriculture?
        </h2>
        <p className="mt-6 text-lg text-white/80 max-w-md mx-auto">
          Join 15,000+ farmers and field agents already using AgroAI.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-8 px-10 py-4 rounded-button gradient-primary text-white font-semibold text-base shadow-glow-green hover:brightness-110 transition-all duration-300"
        >
          Launch Dashboard
        </button>
        <p className="mt-4 text-sm text-lime-green hover:underline cursor-pointer">
          Schedule a Demo
        </p>
      </div>
    </section>
  );
}
