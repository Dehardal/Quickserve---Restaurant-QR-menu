import React, { useState } from 'react';
import '../styles/landing/landing.css';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingHero from '../components/landing/LandingHero';
import ChannelsSection from '../components/landing/ChannelsSection';
import RoiCalculator from '../components/landing/RoiCalculator';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import ComparisonSection from '../components/landing/ComparisonSection';
import FoodBusinessesSection from '../components/landing/FoodBusinessesSection';
import PricingSection from '../components/landing/PricingSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FaqSection from '../components/landing/FaqSection';
import CtaBanner from '../components/landing/CtaBanner';
import LandingFooter from '../components/landing/LandingFooter';
import InteractiveDemoModal from '../components/landing/InteractiveDemoModal';

const LandingPage = () => {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-600 selection:text-white relative overflow-x-hidden">
      {/* 1. Sticky Navigation */}
      <LandingNavbar onOpenDemo={() => setDemoModalOpen(true)} />

      {/* 2. Hero Section */}
      <main>
        <LandingHero onOpenDemo={() => setDemoModalOpen(true)} />

        {/* 3. Three Ordering Channels (Dine-In, Corporate, Takeaway) */}
        <ChannelsSection onOpenDemo={() => setDemoModalOpen(true)} />

        {/* 4. Interactive Aggregator Savings & ROI Calculator */}
        <RoiCalculator />

        {/* 5. Core Platform Features Bento Grid */}
        <FeaturesGrid />

        {/* 6. Honest Comparison Matrix vs Third-Party Aggregators */}
        <ComparisonSection />

        {/* 7. Dedicated Food Businesses Showcase (Restaurants, Cafes, Sweet Shops, Cloud Kitchens) */}
        <FoodBusinessesSection />

        {/* 8. Predictable Subscription Pricing (Hidden for now as requested) */}
        {/* <PricingSection /> */}

        {/* 9. Social Proof Testimonials */}
        <TestimonialsSection />

        {/* 10. Frequently Asked Questions Accordion */}
        <FaqSection />

        {/* 11. High-Impact Call to Action Banner */}
        <CtaBanner onOpenDemo={() => setDemoModalOpen(true)} />
      </main>

      {/* 12. Complete SaaS Footer */}
      <LandingFooter />

      {/* 13. Interactive Customer Menu Simulator Modal */}
      <InteractiveDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
