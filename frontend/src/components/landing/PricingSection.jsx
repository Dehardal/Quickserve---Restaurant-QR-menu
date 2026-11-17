import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import '../../styles/landing/pricing.css';

const PricingSection = () => {
  const [annualBilling, setAnnualBilling] = useState(true);

  const plans = [
    {
      name: 'Single Store',
      tagline: 'Ideal for standalone cafes, diners & food trucks starting digital orders.',
      priceMonthly: 1999,
      priceAnnual: 1499,
      popular: false,
      cta: 'Start 14-Day Free Trial',
      ctaLink: '/signup',
      features: [
        '0% commission on all orders',
        'Unlimited orders & digital menu dishes',
        'Cryptographically signed Table QRs',
        'Live Chef Kitchen Display (KDS)',
        'Direct UPI & Cash settlements',
        'Printable tabletop tent cards',
        'Basic sales & daily order reports',
      ],
    },
    {
      name: 'Pro Kitchen & Chains',
      tagline: 'For busy restaurants, cloud kitchens & brands wanting full domain ownership.',
      priceMonthly: 3799,
      priceAnnual: 2999,
      popular: true,
      cta: 'Get Started with Pro',
      ctaLink: '/signup',
      features: [
        'Everything in Single Store, plus:',
        'Your own Custom Domain (order.brand.com)',
        'Free automatic SSL certificate provisioning',
        'Corporate Office & Desk dropoff channel',
        'Targeted Promo Engine (1st-order / regulars)',
        'Cashfree PG (Cards, NetBanking & UPI)',
        'Print-ready thermal receipts (GSTIN & FSSAI)',
        'Priority 24/7 WhatsApp & phone support',
      ],
    },
    {
      name: 'Agency White-Label',
      tagline: 'For software agencies, freelancers & food consultants managing multiple clients.',
      priceMonthly: 9999,
      priceAnnual: 7999,
      popular: false,
      cta: 'Deploy Agency Server',
      ctaLink: '/signup',
      features: [
        'Everything in Pro Kitchen, plus:',
        'Host unlimited restaurant clients on 1 server',
        'Agency Master Control Tower (/agency)',
        'Custom domain routing per restaurant client',
        'Automated developer revenue split (Cashfree Easy Split)',
        'Dedicated client owner login portals',
        '100% white-label (zero QuickServe branding)',
        'Developer API & priority roadmap requests',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32 px-6 sm:px-12 max-w-7xl mx-auto border-t border-slate-900/80">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
          Transparent Predictable Pricing
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-outfit">
          0% Commission. Flat SaaS Subscription.
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          Unlike food aggregator apps that penalize your growth by demanding 25% – 35% of every order,
          QuickServe charges a predictable flat monthly fee. Keep 100% of your earnings.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold ${!annualBilling ? 'text-white' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setAnnualBilling(!annualBilling)}
            className="w-14 h-8 rounded-full bg-slate-800 p-1 flex items-center transition-colors relative cursor-pointer"
            aria-label="Toggle annual billing"
          >
            <div
              className={`w-6 h-6 rounded-full bg-brand-600 shadow-md transform transition-transform ${
                annualBilling ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
          <span className={`text-xs font-bold flex items-center gap-1.5 ${annualBilling ? 'text-white' : 'text-slate-400'}`}>
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 items-stretch">
        {plans.map((p, idx) => {
          const price = annualBilling ? p.priceAnnual : p.priceMonthly;

          return (
            <div
              key={idx}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative text-left ${
                p.popular
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-brand-500 shadow-2xl shadow-brand-500/10 scale-100 lg:-translate-y-2'
                  : 'bg-slate-900/60 border border-slate-800/80 shadow-md'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                  Most Popular for Busy Restaurants
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white font-outfit">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{p.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono font-outfit">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ month</span>
                </div>

                {annualBilling && (
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    Billed annually (₹{(price * 12).toLocaleString('en-IN')}/year)
                  </span>
                )}

                {/* Features List */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                    Included Capabilities
                  </span>
                  {p.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card CTA */}
              <div className="pt-8 mt-6 border-t border-slate-800/80">
                <Link
                  to={p.ctaLink}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    p.popular
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <span>{p.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingSection;
