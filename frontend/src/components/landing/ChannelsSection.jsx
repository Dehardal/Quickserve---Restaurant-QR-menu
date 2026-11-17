import React, { useState } from 'react';
import {
  Utensils,
  Building2,
  ShoppingBag,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Smartphone,
  Printer,
} from 'lucide-react';
import '../../styles/landing/channels.css';

const channels = [
  {
    id: 'dine_in',
    title: 'Dine-In Table Ordering',
    badge: 'Core Channel',
    tagline: 'Zero Waiter Delays • Faster Table Turnover',
    icon: Utensils,
    accentColor: 'emerald',
    description:
      'Turn tabletop standees into autonomous ordering stations. Guests sit down, scan the encrypted table QR with their phone camera, customize dishes, and place orders directly to the kitchen.',
    highlights: [
      'Cryptographically signed table tokens prevent out-of-store false ordering',
      'Instant Kitchen Display (KDS) routing with audio ding notifications',
      'Table bill request & split settlement via Google Pay, PhonePe, Cards or Cash',
      'Cuts table turnover time by 35% during peak lunch and dinner rush hours',
    ],
    mockup: {
      type: 'Table Standee',
      headline: 'Table 7 Dine-In',
      tag: 'Scanned via iPhone Camera',
      detail1: 'Order #204 · 3 Dishes',
      detail2: 'Auto-routed to Kitchen Line 1',
    },
  },
  {
    id: 'corporate',
    title: 'Corporate & Tech Park Delivery',
    badge: 'High-Volume B2B',
    tagline: 'Exclusive Office Food Partner • Daily Recurring Orders',
    icon: Building2,
    accentColor: 'indigo',
    description:
      'Place custom-branded QR standees in office cafeterias, tech parks (Google, WeWork, TCS, DLF), and co-working spaces. Employees order right from their desks with company and desk number validation.',
    highlights: [
      'Company-specific QR codes with desk number & tower dropoff fields',
      'Batch lunch orders & scheduled delivery runs for office clusters',
      'Exclusive corporate partner discount codes (e.g. 15% off for WeWork members)',
      'Direct customer phone number capture for corporate catering upsells',
    ],
    mockup: {
      type: 'Corporate Hub Standee',
      headline: 'Google Campus Cafeteria',
      tag: 'Desk Delivery Mode',
      detail1: 'Tower B, Desk 412 · Order #819',
      detail2: 'Batch dispatch at 1:15 PM',
    },
  },
  {
    id: 'takeaway',
    title: 'Direct Takeaway & Online Pickup',
    badge: '0% Aggregator Fee',
    tagline: 'Instagram Bio Link • Counter QR Pickup',
    icon: ShoppingBag,
    accentColor: 'purple',
    description:
      'Eliminate 30% aggregator delivery commissions. Put your ordering link in your Instagram bio, WhatsApp catalog, or place a quick-scan takeaway standee at your counter for express pick-ups.',
    highlights: [
      'Accessible anywhere: order.yourrestaurant.com/?type=takeaway',
      'No table token required; seamless guest phone checkout',
      'Collect verified phone numbers for direct WhatsApp marketing campaigns',
      'Prep time notification so customers arrive exactly when food is ready',
    ],
    mockup: {
      type: 'Counter QR Card',
      headline: 'Express Counter Pickup',
      tag: 'Direct Web Checkout',
      detail1: 'Customer: Rahul S. · +91 98765...',
      detail2: 'Ready for pickup in 12 mins',
    },
  },
];

const ChannelsSection = ({ onOpenDemo }) => {
  const [activeTab, setActiveTab] = useState('dine_in');
  const current = channels.find((c) => c.id === activeTab) || channels[0];
  const Icon = current.icon;

  return (
    <section id="channels" className="py-12 sm:py-16 px-6 sm:px-12 max-w-7xl mx-auto border-t border-slate-900/80">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-outfit">
          Three Channels, One Unified Kitchen Engine
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          Whether guests are seated at a table, working in a corporate tech park, or grabbing takeout,
          QuickServe orchestrates every order seamlessly into your kitchen display.
        </p>
      </div>

      {/* 3-Channel Switcher Tabs */}
      <div className="flex items-center justify-center gap-2 mt-8 overflow-x-auto pb-2">
        <div className="p-1.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 shadow-inner">
          {channels.map((ch) => {
            const TabIcon = ch.icon;
            const isActive = ch.id === activeTab;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveTab(ch.id)}
                className={`flex items-center gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <TabIcon className="w-4 h-4 shrink-0" />
                <span>{ch.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Channel Feature Showcase Card */}
      <div className="mt-8 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Channel Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center shadow-xs">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-brand-400 border border-slate-700">
                  {current.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1 font-outfit">
                  {current.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-brand-300">
              {current.tagline}
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {current.description}
            </p>

            {/* Checklist */}
            <div className="space-y-3 pt-2">
              {current.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200 font-medium leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenDemo}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <span>Test Drive This Channel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Standee & Ordering Visual Preview (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-3xl bg-slate-950 border-2 border-slate-800 p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
              {/* Standee Top Notch */}
              <div className="w-12 h-1.5 rounded-full bg-slate-800"></div>

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md">
                <Utensils className="w-6 h-6 text-white" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 block">
                  {current.mockup.type}
                </span>
                <h4 className="text-base font-black text-white uppercase tracking-tight mt-0.5">
                  {current.mockup.headline}
                </h4>
                <p className="text-[10px] text-slate-400">{current.mockup.tag}</p>
              </div>

              {/* QR Code Graphic with Centered Logo */}
              <div className="w-48 h-48 bg-white rounded-2xl p-3 flex items-center justify-center shadow-inner relative group">
                <QrCode className="w-full h-full text-slate-900" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
                      QS
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="w-full p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Routing:</span>
                  <span className="text-emerald-400 font-bold">{current.mockup.detail1}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>Status:</span>
                  <span>{current.mockup.detail2}</span>
                </div>
              </div>

              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                No app download needed • Scans on iOS & Android
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChannelsSection;
