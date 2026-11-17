import React from 'react';
import { CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import '../../styles/landing/comparison.css';

const ComparisonSection = () => {
  const comparisonRows = [
    {
      metric: 'Order Commission',
      aggregator: '25% – 35% cut on every single order',
      quickserve: '0% Commission (Keep 100% of your earnings)',
      highlight: true,
    },
    {
      metric: 'Domain & Branding',
      aggregator: 'Trapped inside third-party marketplace app',
      quickserve: 'Your own domain (e.g. order.theburgerbar.com)',
      highlight: false,
    },
    {
      metric: 'Customer Data Ownership',
      aggregator: 'Masked phone numbers & zero marketing access',
      quickserve: '100% verified customer numbers for WhatsApp marketing',
      highlight: true,
    },
    {
      metric: 'Competitor Advertising',
      aggregator: 'Competitor banners & discounts shown above your dishes',
      quickserve: 'Zero competitor ads. Pure white-label experience',
      highlight: false,
    },
    {
      metric: 'Payment Settlement',
      aggregator: 'Weekly delayed payouts with surprise deductions',
      quickserve: 'Instant direct settlement to your bank / UPI',
      highlight: true,
    },
    {
      metric: 'Hardware Required',
      aggregator: 'Proprietary locked-down merchant printer/POS tablet',
      quickserve: 'Any smartphone, iPad, kitchen laptop, or tablet',
      highlight: false,
    },
    {
      metric: 'Tabletop QR Standees',
      aggregator: 'Generic paper stickers with aggregator branding',
      quickserve: 'Custom printable tent standees with your centered logo',
      highlight: false,
    },
  ];

  return (
    <section id="comparison" className="py-12 sm:py-16 px-6 sm:px-12 max-w-7xl mx-auto border-t border-slate-900/80">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-outfit">
          Aggregator Monopoly vs Your Brand
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          See why over 1,200+ restaurants, cloud kitchens, and franchise groups are switching from delivery marketplace monopolies to direct white-label ordering.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="mt-10 overflow-x-auto">
        <div className="min-w-[680px] bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider bg-slate-950/60">
                <th className="p-5 sm:p-6 text-slate-400 font-bold w-1/4">Key Capability</th>
                <th className="p-5 sm:p-6 text-rose-400 font-bold w-3/8 bg-rose-950/10">
                  <span className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Third-Party Food Apps
                  </span>
                </th>
                <th className="p-5 sm:p-6 text-emerald-400 font-bold w-3/8 bg-emerald-950/20">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    QuickServe Platform
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparisonRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    row.highlight ? 'bg-slate-900/50' : ''
                  }`}
                >
                  <td className="p-5 sm:p-6 font-bold text-slate-200">
                    {row.metric}
                  </td>
                  <td className="p-5 sm:p-6 text-slate-400 bg-rose-950/5 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">✕</span>
                      <span>{row.aggregator}</span>
                    </div>
                  </td>
                  <td className="p-5 sm:p-6 text-slate-100 font-semibold bg-emerald-950/10 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span className={row.highlight ? 'text-emerald-300 font-bold' : ''}>
                        {row.quickserve}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
