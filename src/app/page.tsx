import HeroSection from "@/components/sections/HeroSection";
import TrustedBySection from "@/components/sections/TrustedBySection";
import ProblemSection from "@/components/sections/ProblemSection";
import MetricsSection from "@/components/sections/MetricsSection";
import ServicesSection from "@/components/sections/ServicesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import PricingPreview from "@/components/sections/PricingPreview";
import FinalCTASection from "@/components/sections/FinalCTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <ProblemSection />
      <MetricsSection />
      <ServicesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingPreview />
      <FinalCTASection />
    </>
  );
}


