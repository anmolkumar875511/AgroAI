import { HeroSection } from '@/components/landing/HeroSection';
import { TrustedBySection } from '@/components/landing/TrustedBySection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { DashboardPreviewSection } from '@/components/landing/DashboardPreviewSection';
import { ImpactStatisticsSection } from '@/components/landing/ImpactStatisticsSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <DashboardPreviewSection />
      <ImpactStatisticsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
