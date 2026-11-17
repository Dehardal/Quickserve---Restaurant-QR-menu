import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Globe, ShieldCheck, Heart } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 py-12 px-6 sm:px-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-left">
        {/* Col 1: Brand Info (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Utensils className="w-4 h-4" />
            </div>
            <span className="font-black text-lg text-white font-outfit">QuickServe</span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            The 100% white-label digital ordering & kitchen management engine.
            Host QR menus on custom domains, eliminate aggregator commissions, and retain 100% of your earnings.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] text-slate-300 font-mono">
              All Systems Operational · 99.99% Uptime
            </span>
          </div>
        </div>

        {/* Col 2: Ordering Channels */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Ordering Channels</h4>
          <ul className="space-y-2">
            <li>
              <a href="#channels" className="hover:text-white transition-colors">
                Dine-In Table QR
              </a>
            </li>
            <li>
              <a href="#channels" className="hover:text-white transition-colors">
                Corporate Office Dropoff
              </a>
            </li>
            <li>
              <a href="#channels" className="hover:text-white transition-colors">
                Takeaway Counter Pickup
              </a>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Live Kitchen Display (KDS)
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Table QR Studio
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Food Verticals & Tools */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Food Verticals</h4>
          <ul className="space-y-2">
            <li>
              <a href="#businesses" className="hover:text-white transition-colors">
                Dine-In Restaurants
              </a>
            </li>
            <li>
              <a href="#businesses" className="hover:text-white transition-colors">
                Cafes & Bakeries
              </a>
            </li>
            <li>
              <a href="#businesses" className="hover:text-white transition-colors">
                Sweet Shops & Mithai
              </a>
            </li>
            <li>
              <a href="#businesses" className="hover:text-white transition-colors">
                Cloud Kitchens & Takeaway
              </a>
            </li>
            <li>
              <a href="#calculator" className="hover:text-white transition-colors text-amber-400 font-semibold">
                Savings Calculator
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: Portals & Legal */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Access & Compliance</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/login" className="hover:text-white transition-colors">
                Staff & Manager Login
              </Link>
            </li>
            <li>
              <Link to="/signup" className="hover:text-white transition-colors">
                Register New Restaurant
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Owner Dashboard
              </Link>
            </li>
            <li>
              <Link to="/legal" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/policies" className="hover:text-white transition-colors">
                Privacy & Refund Policies
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="max-w-7xl mx-auto pt-10 mt-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
        <p>© {new Date().getFullYear()} QuickServe Technologies. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link to="/legal" className="hover:text-white transition-colors">
            Merchant Compliance
          </Link>
          <Link to="/policies" className="hover:text-white transition-colors">
            FSSAI & GST Ready
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">Built for food founders with zero aggregator tax</span>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
