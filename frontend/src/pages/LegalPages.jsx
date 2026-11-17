import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  RotateCcw, 
  Truck, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Lock, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';
import { useTenant } from '../context/TenantContext';

const PolicyModal = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
          {children}
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

const LegalPages = () => {
  const { tenant } = useTenant();
  const [modalType, setModalType] = useState(null);

  const brandName = tenant?.name || 'Restaurant';
  const brandEmail = tenant?.contactNumber ? `contact@${tenant?.slug || 'quickserve'}.com` : 'support@restaurant.com';
  const brandPhone = tenant?.contactNumber || '+91 98765 43210';
  const brandAddress = tenant?.address || 'Restaurant Premises';
  const openingHours = tenant?.openingHours || '09:00 AM – 11:00 PM (7 Days a Week)';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Back to Menu</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300">Merchant Compliance & Legal Center</span>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{brandName} • Official Policies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Legal & Customer Compliance
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Transparent operating terms, payment protection, delivery timelines, and privacy policies governing our direct digital food ordering platform.
          </p>
        </div>

        {/* 5 Legal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Contact Us & Business Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Customer Support & Grievance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reach out for billing inquiries, order feedback, or payment disputes directly to our manager.
              </p>
              <div className="pt-2 space-y-2 text-xs text-slate-300 border-t border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span><strong>Merchant:</strong> {brandName}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{brandAddress}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{brandPhone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{brandEmail}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{openingHours}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setModalType('contact')}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              View Full Contact Details
            </button>
          </div>

          {/* 2. Refund & Cancellation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Refund & Cancellation Policy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rules regarding order cancellation, preparation windows, and electronic payment refunds.
              </p>
              <div className="pt-2 space-y-2 text-xs text-slate-300 border-t border-slate-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Instant cancellation within 60 seconds if kitchen has not started cooking.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>100% refund for failed transactions, dish unavailability, or payment errors.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>UPI / Card refunds processed within 3-5 business days directly to original payment source.</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setModalType('refund')}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Read Refund Policy
            </button>
          </div>

          {/* 3. Shipping & Delivery Policy */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Fulfillment & Delivery Policy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Timelines for Dine-In table service, takeaway pickup counter, and corporate desk deliveries.
              </p>
              <div className="pt-2 space-y-2 text-xs text-slate-300 border-t border-slate-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Dine-In Table:</strong> Freshly prepared and served within 12-20 minutes.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Takeaway Pickup:</strong> Packed in insulated containers, ready within 15-25 minutes.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Corporate Desk Delivery:</strong> Hand-delivered directly to partner building pantry/desk.</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setModalType('shipping')}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Read Delivery Policy
            </button>
          </div>

          {/* 4. Terms & Conditions */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Terms of Service</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Legal terms governing menu pricing, QR scanning, coupons, and dine-in code of conduct.
              </p>
              <div className="pt-2 space-y-2 text-xs text-slate-300 border-t border-slate-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Prices quoted in Indian Rupees (INR) with itemized GST breakdown at checkout.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Coupons and discounts subject to minimum order thresholds.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>FSSAI food hygiene compliance maintained across all preparation stations.</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setModalType('terms')}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Read Terms of Service
            </button>
          </div>

          {/* 5. Privacy Policy */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-950/80 border border-sky-800 text-sky-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Privacy & Data Security Policy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                How {brandName} protects your personal identity, mobile number, and financial data during digital ordering.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-slate-300 border-t border-slate-800">
                <div>
                  <h4 className="font-bold text-white mb-1">🔒 Zero Card Storage</h4>
                  <p className="text-slate-400 text-[11px]">We never store credit card numbers, CVVs, or UPI PINs. All payments are encrypted by Cashfree (PCI-DSS Level 1 compliant).</p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">📱 No Spam Guarantee</h4>
                  <p className="text-slate-400 text-[11px]">Your phone number is strictly used for live order status updates and kitchen verification. We do not sell numbers to telemarketers.</p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">🛡️ SSL 256-Bit TLS</h4>
                  <p className="text-slate-400 text-[11px]">All table interactions, token signatures, and API calls are secured with industry-standard TLS encryption.</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setModalType('privacy')}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Read Full Privacy Policy
            </button>
          </div>
        </div>
      </main>

      {/* Modals for Details */}
      <PolicyModal title="Contact Information" isOpen={modalType === 'contact'} onClose={() => setModalType(null)}>
        <p>For inquiries, order status, or grievance redressal, please contact:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Entity Name:</strong> {brandName}</li>
          <li><strong>Operating Address:</strong> {brandAddress}</li>
          <li><strong>Phone:</strong> {brandPhone}</li>
          <li><strong>Email:</strong> {brandEmail}</li>
          <li><strong>Operating Hours:</strong> {openingHours}</li>
        </ul>
      </PolicyModal>

      <PolicyModal title="Refund & Cancellation Policy" isOpen={modalType === 'refund'} onClose={() => setModalType(null)}>
        <p><strong>1. Cancellation Window:</strong> Orders can only be cancelled within 60 seconds of placement if the kitchen has not accepted the order.</p>
        <p><strong>2. Defective or Incorrect Items:</strong> If an item is delivered burnt, defective, or incorrect, please notify the store manager immediately. A fresh replacement or full refund will be issued.</p>
        <p><strong>3. Electronic Payment Refunds:</strong> Refunds for failed or double-charged online payments are credited back to the original source within 3-5 business days via Cashfree.</p>
      </PolicyModal>

      <PolicyModal title="Fulfillment & Shipping Policy" isOpen={modalType === 'shipping'} onClose={() => setModalType(null)}>
        <p><strong>1. Dine-In Table Orders:</strong> Food is prepared hot and served directly to your designated table number within 12-20 minutes.</p>
        <p><strong>2. Takeaway / Pickup:</strong> Orders are packaged in sealed containers and placed at the takeaway counter ready for customer pickup.</p>
        <p><strong>3. Corporate Desk Deliveries:</strong> Delivered directly to the partner office building desk or pantry as indicated during checkout.</p>
      </PolicyModal>

      <PolicyModal title="Terms of Service" isOpen={modalType === 'terms'} onClose={() => setModalType(null)}>
        <p>By scanning our QR code or accessing this menu, you agree to these terms:</p>
        <p>1. Prices are displayed in INR and are subject to applicable GST taxes.</p>
        <p>2. Alcohol and age-restricted beverages (if any) require valid physical government ID verification upon delivery.</p>
        <p>3. Fraudulent orders or tampering with URL parameters is strictly prohibited and logged.</p>
      </PolicyModal>

      <PolicyModal title="Privacy Policy" isOpen={modalType === 'privacy'} onClose={() => setModalType(null)}>
        <p>We respect your privacy. Data collected (name, mobile number) is used exclusively for order fulfillment and live communication.</p>
        <p>We do not store financial payment information or card credentials.</p>
      </PolicyModal>
    </div>
  );
};

export default LegalPages;

