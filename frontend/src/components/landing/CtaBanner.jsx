import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Zap, CheckCircle2 } from 'lucide-react';

const CtaBanner = ({ onOpenDemo }) => {
  return (
    <section className="py-10 sm:py-14 px-6 sm:px-12 max-w-7xl mx-auto">
      <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-brand-500/20">
        {/* Ambient lighting decor */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight font-outfit">
            Ready to Take Control of Your Restaurant's Revenue?
          </h2>

          <p className="text-sm sm:text-base text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            Join over 1,200+ restaurants, cafes, sweet shops, and cloud kitchens. Launch your own direct QR ordering system under your domain today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 hover:bg-slate-100 text-sm font-black rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Start Free 14-Day Store Setup</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-7 py-4 bg-black/20 hover:bg-black/30 border border-white/20 text-white text-sm font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <Play className="w-4 h-4 text-white fill-white" />
              <span>Interactive Customer Demo</span>
            </button>
          </div>

          {/* Micro trust signals */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-indigo-100">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> No credit card required upfront
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Cancel anytime with 1-click
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Free SSL & DNS guide included
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
