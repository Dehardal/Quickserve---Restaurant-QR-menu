import React from 'react';
import '../../styles/landing/hero.css';
import { Link } from 'react-router-dom';
import {
  Ticket,
  ArrowRight,
  Play,
  CheckCircle2,
  QrCode,
  Utensils,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Clock,
  Check,
} from 'lucide-react';

const LandingHero = ({ onOpenDemo }) => {
  return (
    <section id="top" className="relative overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 px-6 sm:px-12 max-w-7xl mx-auto text-center">
      {/* Dynamic Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-500/12 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute top-1/3 left-1/4 w-[360px] h-[360px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight max-w-5xl mx-auto leading-[1.1] font-outfit">
        Turn Every Dining Table, Office Desk & Counter Into a{' '}
        <span className="text-brand-600 inline-block font-black">
          Direct Checkout Machine
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto mt-6 leading-relaxed">
        Stop giving away 25% to 35% of your hard-earned revenue to food delivery apps.
        Deploy your own branded QR menu under your custom domain with live kitchen tickets,
        promo codes, and instant direct bank UPI settlements.
      </p>

      {/* Dual CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        <Link
          to="/signup"
          className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
        >
          <span>Start Free Restaurant Setup</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <button
          onClick={onOpenDemo}
          className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:border-brand-200 hover:text-brand-600"
        >
          <Play className="w-4 h-4 text-brand-600 fill-brand-600" />
          <span>Interactive Customer Demo</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12 pt-6 border-t border-slate-200 text-left">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-semibold">Keep 100% Revenue</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block font-outfit">0% Cut</span>
          <span className="text-xs text-slate-500">Zero commission on orders</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <div className="flex items-center gap-2 text-brand-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold">Lightning Checkout</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block font-outfit">&lt; 3 Sec</span>
          <span className="text-xs text-slate-500">Scan to order with phone camera</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold">Table Velocity</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block font-outfit">+35%</span>
          <span className="text-xs text-slate-500">Faster dining table turnover</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <div className="flex items-center gap-2 text-brand-600 mb-1">
            <CreditCard className="w-4 h-4" />
            <span className="text-xs font-semibold">Direct Settlement</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block font-outfit">Instant</span>
          <span className="text-xs text-slate-500">Direct to UPI / Bank Account</span>
        </div>
      </div>

      {/* Live Interactive Product UI Mockup */}
      <div className="mt-12 sm:mt-16 max-w-5xl mx-auto relative">
        <div className="rounded-3xl bg-white p-4 sm:p-7 border border-slate-200 shadow-premium relative overflow-hidden text-left">
          {/* Mockup Top Window Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
              <span className="text-slate-500 font-mono text-[11px] ml-2 hidden sm:inline">
                https://order.theburgerbar.com (Custom Domain with Free SSL)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                ● Live WebSocket Sync
              </span>
            </div>
          </div>

          {/* Inner Content Grid: Left Customer Menu Preview + Right Kitchen KDS & Settlement */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            {/* Customer Menu Mockup (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">The Burger Bar & Roastery</span>
                  <span className="text-[10px] text-slate-500">Table 4 (Dine-In Secured Token)</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-bold">
                  2 Items in Bucket
                </span>
              </div>

              {/* Sample Food Items */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Truffle Smoked Smash Burger</p>
                      <p className="text-[10px] text-slate-500">Brioche bun, double aged cheddar, house sauce</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 font-mono">₹380</span>
                    <span className="block text-[10px] text-emerald-600 font-medium">1x Added</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Cold Brew Tonic & Lime</p>
                      <p className="text-[10px] text-slate-500">Single origin arabica, sparkling tonic</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 font-mono">₹200</span>
                    <span className="block text-[10px] text-emerald-600 font-medium">1x Added</span>
                  </div>
                </div>
              </div>

              {/* Promo Applied Bar */}
              <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-brand-700">
                  <Ticket className="w-4 h-4 text-brand-600" />
                  <span className="font-semibold text-[11px]">Coupon "WELCOME50" applied!</span>
                </div>
                <span className="font-mono text-emerald-700 font-bold">-₹100 (1st Order)</span>
              </div>

              {/* Checkout Bar */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Total Payable</span>
                  <span className="text-base font-black text-slate-900 font-mono">₹480</span>
                </div>
                <button
                  onClick={onOpenDemo}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Pay & Send to Kitchen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live KDS & Real-time Settlement (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* KDS Floating Ticket */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-brand-600" /> Chef KDS Display
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">Ticket #1042</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-800">
                    <span className="font-bold">1x Truffle Smoked Smash</span>
                    <span className="text-emerald-600 font-bold">PREPARING</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-800">
                    <span className="font-bold">1x Cold Brew Tonic</span>
                    <span className="text-brand-600 font-bold">READY</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3 text-emerald-600" /> Instant audio chime sounded in kitchen
                </p>
              </div>

              {/* Direct UPI Settlement */}
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-50 via-emerald-50/60 to-teal-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">
                    Instant Bank Payout
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">UPI / QR Settle</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-emerald-900 font-mono">+₹480.00</span>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">100% Settled</span>
                </div>
                <p className="text-[10px] text-emerald-800">
                  Aggregator fee: <strong className="text-emerald-950 font-bold">₹0.00</strong> (Saved ₹144 on this single order!)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
