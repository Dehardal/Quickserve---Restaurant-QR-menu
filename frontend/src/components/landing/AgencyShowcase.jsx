import React from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Building2,
  Globe,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  Code2,
} from 'lucide-react';
import '../../styles/landing/agency.css';

const AgencyShowcase = () => {
  return (
    <section id="agency" className="py-24 sm:py-32 px-6 sm:px-12 max-w-7xl mx-auto border-t border-slate-900/80">
      <div className="rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-indigo-950/50 border border-brand-500/30 p-8 sm:p-14 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10 text-left">
          {/* Agency Pitch (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30 text-xs font-bold uppercase tracking-wider">
              <Server className="w-3.5 h-3.5" /> For Freelancers & Software Agencies
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-outfit leading-tight">
              Launch Your Own Digital Restaurant SaaS Business
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Don’t just build one-off websites. Run a recurring-revenue digital ordering agency.
              Use our built-in <strong>Agency Master Console</strong> to provision and manage dozens of restaurant clients on a single server.
            </p>

            {/* Benefit Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-brand-400" /> Custom Domains Per Client
                </span>
                <p className="text-[11px] text-slate-400">
                  Every restaurant runs on their own domain (order.clientname.com) with automatic SSL certificates.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Automated Revenue Split
                </span>
                <p className="text-[11px] text-slate-400">
                  Charge monthly SaaS retainers, or earn an automated 2% – 5% commission cut via Cashfree Easy Split.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" /> Dedicated Client Portals
                </span>
                <p className="text-[11px] text-slate-400">
                  Each restaurant gets their own manager credentials to configure menus, tables, and view live orders.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" /> Complete Multi-Tenancy
                </span>
                <p className="text-[11px] text-slate-400">
                  Scale to 50+ restaurant brands on a single low-cost Node.js instance with zero server overhead.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/agency"
                className="px-6 py-3.5 bg-white hover:bg-slate-200 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center gap-2"
              >
                <span>Access Agency Master Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Interactive Agency Terminal Mockup (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 shadow-2xl font-mono text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Agency Multi-Domain Engine
                </span>
              </div>

              <div className="space-y-3 text-[11px]">
                <p className="text-slate-400">// Agency Provisioning Terminal</p>
                
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <span className="text-emerald-400 font-bold block">✓ Tenant 1: "The Roastery Cafe"</span>
                  <span className="text-slate-400 block text-[10px]">Domain: order.theroastery.com (CNAME)</span>
                  <span className="text-amber-400 block text-[10px]">Split: 3.5% automated dev royalty</span>
                  <span className="text-emerald-300 block text-[10px]">Status: Active · ₹3,84,000 processed</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <span className="text-emerald-400 font-bold block">✓ Tenant 2: "Smash Burger Co."</span>
                  <span className="text-slate-400 block text-[10px]">Domain: order.smashburger.in (CNAME)</span>
                  <span className="text-indigo-400 block text-[10px]">Model: ₹3,500/mo retainer</span>
                  <span className="text-emerald-300 block text-[10px]">Status: Active · 45 tables live</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                  <span className="text-blue-400 font-bold block">✓ Tenant 3: "Wok & Roll Express"</span>
                  <span className="text-slate-400 block text-[10px]">Domain: order.wokandroll.com</span>
                  <span className="text-purple-400 block text-[10px]">Mode: Corporate Hub + Takeaway</span>
                  <span className="text-emerald-300 block text-[10px]">Status: Active · WeWork Partner</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Cluster Load: 4.2%</span>
                <span className="text-emerald-400 font-bold">0 Server Crashes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgencyShowcase;
