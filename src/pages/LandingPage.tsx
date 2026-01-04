import HeroSection from "@/components/landing/HeroSection";
import LiveTicker from "@/components/landing/LiveTicker";
import FeatureCards from "@/components/landing/FeatureCards";
import Footer from "@/components/landing/Footer";

const LandingPage = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <HeroSection />
      <LiveTicker />
      <FeatureCards />
      <Footer />
    </main>
  );
};

export default LandingPage;