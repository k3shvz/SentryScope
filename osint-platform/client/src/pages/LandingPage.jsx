import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Platforms from '../components/landing/Platforms';
import Security from '../components/landing/Security';
import Screenshots from '../components/landing/Screenshots';
import FAQ from '../components/landing/FAQ';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base">
      <PublicNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Platforms />
      <Security />
      <Screenshots />
      <FAQ />
      <Footer />
    </div>
  );
}
