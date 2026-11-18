import React from 'react';
import {
  Globe,
  Utensils,
  QrCode,
  Ticket,
  CreditCard,
  Receipt,
  ShieldCheck,
  Zap,
  Volume2,
  Percent,
  Check,
} from 'lucide-react';
import '../../styles/landing/features.css';

const features = [
  {
    icon: Globe,
    color: 'from-blue-500 to-indigo-600',
    title: 'Your Own Custom Branded Website',
    badge: '100% Your Brand',
    desc: 'Never send your customers to third-party delivery apps. Host your digital ordering menu on your own web address (like order.yourbrand.com) with free automatic SSL security.',
    points: [
      'Connect your domain in under 5 minutes (e.g. order.mycafe.com)',
      'Free automatic SSL padlock security for customer trust',
      'Zero competitor ads or marketplace distractions—only your menu',
    ],
  },
  {
    icon: Utensils,
    color: 'from-emerald-500 to-teal-600',
    title: 'Live Kitchen Display (KDS)',
    badge: 'Instant Sound Alerts',
    desc: 'Orders beam straight into your kitchen display seconds after customer checkout. Chefs get instant acoustic chimes and manage order prep stages with zero paper tickets.',
    points: [
      'Synthesized double chime audio alerts on new tickets',
      'Live status pipelines: Pending → Preparing → Ready → Served',
      'Works on any iPad, Android tablet, phone, or kitchen monitor',
    ],
  },
  {
    icon: QrCode,
    color: 'from-brand-600 to-indigo-600',
    title: 'Table Standee Studio with Your Logo',
    badge: 'Print-Ready QR',
    desc: 'Generate high-resolution printable table standees with your restaurant logo composited right in the center of the QR without degrading camera scan reliability.',
    points: [
      'Protective white plate keeps error-correction crisp & readable',
      'Download high-res 640x640 PNGs for tent card printing',
      'One-click @media print table tent standee generator',
    ],
  },
  {
    icon: Ticket,
    color: 'from-violet-500 to-purple-600',
    title: 'Targeted Offers & Customer Loyalty',
    badge: 'Fraud-Proof Coupons',
    desc: 'Create highly targeted promotional coupon codes verified automatically by customer mobile number at checkout to drive repeats and customer loyalty.',
    points: [
      'First-Time Customer discounts (verified by past order count = 0)',
      'Loyalty Regulars rewards (unlocked only for repeat visitors)',
      'Usage limits per mobile number (e.g. max 1x per phone)',
    ],
  },
  {
    icon: CreditCard,
    color: 'from-purple-500 to-pink-600',
    title: 'Direct UPI & Card Payments (0% Cut)',
    badge: 'Zero Commission',
    desc: 'Collect customer payments directly via Google Pay, PhonePe, Paytm, Cards, NetBanking, or Counter Cash with instant direct-to-bank settlement.',
    points: [
      'Direct-to-bank UPI payment without middleman escrow holdbacks',
      'Cashfree Payment Gateway integration with instant webhook callbacks',
      'Keep 100% of customer ticket spend with zero commission deductions',
    ],
  },
  {
    icon: Receipt,
    color: 'from-rose-500 to-red-600',
    title: 'Legal Tax Invoices & Compliance',
    badge: 'GST & FSSAI Ready',
    desc: 'Generate printable thermal receipts containing your business legal entity, GSTIN, and FSSAI license numbers. Complete with merchant consumer policy pages.',
    points: [
      'Print-ready thermal receipts (58mm / 80mm format)',
      'Itemized CGST, SGST, service charges & custom footer notes',
      'Hosted Terms, Privacy, Refund, and Delivery legal compliance pages',
    ],
  },
];

const FeaturesGrid = () => {
  return (
    <section id="features" className="py-12 sm:py-16 px-6 sm:px-12 max-w-7xl mx-auto border-t border-slate-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-outfit">
          Everything Your Food Business Needs
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          Built from the ground up for busy cafes, quick-serve counters, dine-in restaurants, sweet shops, and cloud kitchens.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-brand-300 transition-all duration-300 shadow-soft hover:shadow-xl hover:shadow-brand-500/5 group text-left flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors font-outfit">
                  {feat.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              {/* Feature Points */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                {feat.points.map((pt, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2 text-[11px] text-slate-700">
                    <Check className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesGrid;
