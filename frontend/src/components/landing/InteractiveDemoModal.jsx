import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  QrCode,
  Utensils,
  Plus,
  Minus,
  Ticket,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import '../../styles/landing/demo-modal.css';

const sampleDishes = [
  {
    id: 'd1',
    name: 'Truffle Smoked Smash Burger',
    category: 'Burgers',
    price: 360,
    desc: 'Double smash patty, aged cheddar, black truffle aioli, toasted brioche',
    tag: 'Bestseller',
  },
  {
    id: 'd2',
    name: 'Parmesan Herb Loaded Fries',
    category: 'Sides',
    price: 180,
    desc: 'Crispy hand-cut fries, shaved parmesan, rosemary salt, garlic dip',
    tag: 'Chef Choice',
  },
  {
    id: 'd3',
    name: 'Single Origin Cold Brew Tonic',
    category: 'Beverages',
    price: 210,
    desc: '18-hour cold steeped arabica, artisanal citrus tonic water',
    tag: 'Refreshing',
  },
];

const InteractiveDemoModal = ({ isOpen, onClose }) => {
  const [cart, setCart] = useState({
    d1: 1,
    d3: 1,
  });
  const [coupon, setCoupon] = useState('FIRST50');
  const [couponApplied, setCouponApplied] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!isOpen) return null;

  const addItem = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const removeItem = (id) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[id] > 1) {
        copy[id] -= 1;
      } else {
        delete copy[id];
      }
      return copy;
    });
  };

  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const dish = sampleDishes.find((d) => d.id === id);
    return sum + (dish ? dish.price * qty : 0);
  }, 0);

  const discount = couponApplied ? Math.min(150, Math.round(subtotal * 0.25)) : 0;
  const grandTotal = Math.max(0, subtotal - discount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'FIRST50' || coupon.trim().toUpperCase() === 'WELCOME20') {
      setCouponApplied(true);
    } else {
      alert('Try promo code "FIRST50" or "WELCOME20" for this interactive demo!');
    }
  };

  const handleCheckout = () => {
    setOrderPlaced(true);
  };

  const resetDemo = () => {
    setCart({ d1: 1, d3: 1 });
    setCoupon('FIRST50');
    setCouponApplied(true);
    setOrderPlaced(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-left text-slate-800 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Close interactive demo"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center font-bold">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 font-outfit">
                Live Customer QR Menu Simulator
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Table 4 Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Experience the exact instant checkout flow your diners and office guests see on their phones.
            </p>
          </div>
        </div>

        {orderPlaced ? (
          /* Order Confirmation Screen */
          <div className="py-8 text-center space-y-5 animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-600 font-bold block">
                ● Live WebSocket Beamed into Kitchen Display
              </span>
              <h4 className="text-2xl font-black text-slate-900 mt-1 font-outfit">
                Order #1042 Received!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your chefs just heard a double acoustic chime in the kitchen. Order ticket printed and prep is underway for <strong>Table 4</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 max-w-sm mx-auto text-left">
              <div className="flex justify-between text-slate-700">
                <span>Total Paid via UPI:</span>
                <span className="font-bold text-slate-900 font-mono">₹{grandTotal}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Aggregator Commission:</span>
                <span className="font-bold text-emerald-600 font-mono">₹0.00 (0% Cut)</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px] pt-2 border-t border-slate-200">
                <span>Routing:</span>
                <span className="font-semibold text-slate-700">Direct Kitchen WebSocket Sync</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                onClick={onClose}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>Launch Your Free Restaurant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={resetDemo}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Reset Demo
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Menu & Cart Simulator */
          <div className="space-y-5">
            {/* Sample Dishes List */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                1. Browse Dishes & Add to Order
              </span>
              {sampleDishes.map((dish) => {
                const qty = cart[dish.id] || 0;
                return (
                  <div
                    key={dish.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 transition-colors hover:border-slate-300"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{dish.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-50 text-brand-700 border border-brand-200 shrink-0">
                          {dish.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{dish.desc}</p>
                      <span className="text-xs font-bold text-slate-900 font-mono mt-1 block">
                        ₹{dish.price}
                      </span>
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-1 shrink-0 shadow-xs">
                        <button
                          onClick={() => removeItem(dish.id)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 px-1 font-mono">{qty}</span>
                        <button
                          onClick={() => addItem(dish.id)}
                          className="w-7 h-7 rounded-lg bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addItem(dish.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-brand-600 hover:text-white hover:border-brand-600 text-slate-700 text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-xs"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Promo Code Simulator */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                2. Apply Targeted Coupon Code
              </span>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter FIRST50 or WELCOME20"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Apply
                </button>
              </form>
              {couponApplied && (
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <Ticket className="w-3.5 h-3.5 text-emerald-600" /> Coupon "{coupon}" applied (1st Order Discount)
                  </span>
                  <span className="font-mono font-bold text-emerald-700">-₹{discount}</span>
                </div>
              )}
            </div>

            {/* Bill Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({Object.values(cart).reduce((a, b) => a + b, 0)} items):</span>
                <span className="font-mono text-slate-900 font-semibold">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount:</span>
                  <span className="font-mono">-₹{discount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold">
                <span className="text-slate-900 text-sm">Total Amount:</span>
                <span className="text-lg font-black text-slate-900 font-mono">₹{grandTotal}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={handleCheckout}
              disabled={subtotal === 0}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-brand-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Simulate "Pay ₹{grandTotal} via UPI & Send to Kitchen"</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveDemoModal;