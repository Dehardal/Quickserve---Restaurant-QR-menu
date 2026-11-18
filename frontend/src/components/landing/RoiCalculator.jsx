import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Calculator,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import '../../styles/landing/calculator.css';

const RoiCalculator = () => {
  const [ordersPerMonth, setOrdersPerMonth] = useState(1500);
  const [avgOrderValue, setAvgOrderValue] = useState(420);

  const monthlyGrossRevenue = ordersPerMonth * avgOrderValue;
  // Standard aggregator take rate (28% average commission including platform fees & delivery markups)
  const aggregatorTakeRate = 0.28;
  const monthlyAggregatorLost = Math.round(monthlyGrossRevenue * aggregatorTakeRate);
  
  // QuickServe flat monthly SaaS subscription (0% commission)
  const quickserveMonthlyFee = 1999;
  const monthlySavings = Math.max(0, monthlyAggregatorLost - quickserveMonthlyFee);
  const annualSavings = monthlySavings * 12;

  const formatCurrency = (val) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  return (
    <section id="calculator" className="py-12 sm:py-16 px-6 sm:px-12 max-w-7xl mx-auto border-t border-slate-200">
      <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-14 shadow-premium relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-50/60 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="text-center max-w-3xl mx-auto space-y-3 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-outfit">
            How Much Are Food Aggregators Taking From You?
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Slide your daily order volume and average bill size to calculate the exact profits you reclaim every month by switching to QuickServe direct QR ordering.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-center relative z-10">
          {/* Sliders Input Panel (7 Cols) */}
          <div className="lg:col-span-7 space-y-8 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/90 text-left">
            {/* Slider 1: Monthly Orders */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Monthly Orders
                </label>
                <span className="text-lg font-black text-brand-600 font-mono">
                  {ordersPerMonth.toLocaleString()} orders/mo
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="10000"
                step="100"
                value={ordersPerMonth}
                onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>200 orders</span>
                <span>5,000 orders</span>
                <span>10,000 orders</span>
              </div>
            </div>

            {/* Slider 2: Average Order Value */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Average Order Value (AOV)
                </label>
                <span className="text-lg font-black text-brand-600 font-mono">
                  {formatCurrency(avgOrderValue)}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="2500"
                step="25"
                value={avgOrderValue}
                onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>₹100</span>
                <span>₹1,250</span>
                <span>₹2,500</span>
              </div>
            </div>

            {/* Monthly Gross Breakdown */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                  Your Total Monthly Sales
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {formatCurrency(monthlyGrossRevenue)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider font-bold text-rose-600 block">
                  Lost to Aggregator Cut (~28%)
                </span>
                <span className="text-lg sm:text-xl font-bold text-rose-600 font-mono">
                  -{formatCurrency(monthlyAggregatorLost)} / mo
                </span>
              </div>
            </div>
          </div>

          {/* Results Card (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-emerald-600 via-emerald-600 to-teal-700 border border-emerald-500 p-8 text-center space-y-6 shadow-xl relative text-white">
            {/* Top pill */}
            <div className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-white border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              100% Direct Profit Retention
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-emerald-100 block font-semibold">
                You Reclaim Every Year
              </span>
              <span className="text-4xl sm:text-5xl font-black text-white block font-mono font-outfit">
                {formatCurrency(annualSavings)}
              </span>
              <span className="text-xs text-emerald-100 block pt-1">
                That is <strong className="text-white font-mono">{formatCurrency(monthlySavings)}</strong> deposited back into your bank every month!
              </span>
            </div>

            {/* Comparison bullets */}
            <div className="p-4 rounded-2xl bg-black/20 border border-white/15 space-y-2.5 text-xs text-left">
              <div className="flex items-center justify-between text-emerald-100">
                <span>Food Delivery Apps:</span>
                <span className="text-rose-200 font-bold">-{formatCurrency(monthlyAggregatorLost)}/mo</span>
              </div>
              <div className="flex items-center justify-between text-emerald-100">
                <span>QuickServe Flat Plan:</span>
                <span className="text-white font-bold font-mono">₹1,999/mo (0% cut)</span>
              </div>
              <div className="pt-2 border-t border-white/20 flex items-center justify-between font-bold text-white">
                <span>Net Monthly Savings:</span>
                <span className="text-emerald-200 font-mono text-sm">+{formatCurrency(monthlySavings)}</span>
              </div>
            </div>

            <Link
              to="/signup"
              className="w-full py-4 bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Stop Paying 28% Commission</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoiCalculator;
