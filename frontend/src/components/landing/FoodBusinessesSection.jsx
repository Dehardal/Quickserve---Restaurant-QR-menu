import React from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils,
  Coffee,
  Store,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  QrCode,
  DollarSign,
} from 'lucide-react';
import '../../styles/landing/businesses.css';

const FoodBusinessesSection = () => {
  return (
    <section id="businesses" className="py-12 sm:py-16 px-6 sm:px-12 max-w-7xl mx-auto border-t border-slate-200">
      <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-14 shadow-premium relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50/50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10 text-left">
          {/* Main Pitch (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-outfit leading-tight">
              Built for Restaurants, Cafes, Sweet Shops & Food Outlets
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Stop paying 25% to 35% commission cuts to delivery aggregators. Whether you operate a sit-down family restaurant, a busy specialty cafe, a famous mithai sweet shop, or a delivery cloud kitchen—QuickServe gives your business its own direct digital ordering engine.
            </p>

            {/* 4 Food Business Verticals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-brand-200 transition-colors">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-brand-600" /> Dine-In Family Restaurants
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Custom tabletop QR standees with your centered logo. Diners scan, browse, order & settle bills via UPI without waiting for busy waiters.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-brand-200 transition-colors">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-amber-600" /> Cafes, Bakeries & Coffee Bars
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Speed up counter throughput. Baristas receive acoustic alerts straight to their iPad or phone the second an iced latte or croissant is ordered.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-brand-200 transition-colors">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-600" /> Sweet Shops & Chaat Counters
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Crush evening and festival rush hour crowds. Generate rapid digital tokens, accept direct QR payments, and eliminate cash register queues.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-brand-200 transition-colors">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-brand-600" /> Cloud Kitchens & Takeaway
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Put your ordering link in your Instagram bio & WhatsApp status. Keep 100% of customer spend with zero aggregator commissions.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/signup"
                className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-brand-500/20 flex items-center gap-2"
              >
                <span>Launch Your Store Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Live Kitchen & Counter Dispatcher Mockup (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-2xl font-mono text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Live Kitchen & Counter Dispatcher
                </span>
              </div>

              <div className="space-y-3 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>// Live Ticket Feed</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    3 Active Tickets
                  </span>
                </div>
                
                {/* Order 1: Dine-In Restaurant */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold block">✓ Dine-In Table 7</span>
                    <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-bold">Line 1 · Cooking (6m)</span>
                  </div>
                  <span className="text-slate-300 block text-[11px]">1x Paneer Butter Masala, 3x Butter Naan, 1x Dal Makhani</span>
                  <span className="text-slate-500 block text-[10px]">Payment: Direct UPI QR · ₹620 settled</span>
                </div>

                {/* Order 2: Roastery Cafe */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold block">✓ Cafe Barista Counter</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded font-bold">Ready for Pickup</span>
                  </div>
                  <span className="text-slate-300 block text-[11px]">2x Iced Spanish Latte, 1x Butter Croissant</span>
                  <span className="text-slate-500 block text-[10px]">Customer: Priya M. · Desk #304 Tech Park</span>
                </div>

                {/* Order 3: Sweet Shop */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-400 font-bold block">✓ Mithai & Chaat Token #42</span>
                    <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded font-bold">Packed & Served</span>
                  </div>
                  <span className="text-slate-300 block text-[11px]">1 kg Special Kaju Katli (Gift Box), 2x Raj Kachori</span>
                  <span className="text-slate-500 block text-[10px]">Payment: Google Pay UPI · ₹1,180 direct to store</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Aggregator Commission: <strong className="text-white">₹0</strong></span>
                <span className="text-emerald-400 font-bold">Keep 100% Earnings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodBusinessesSection;
