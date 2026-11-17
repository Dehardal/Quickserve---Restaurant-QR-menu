import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import '../../styles/landing/faq.css';

const faqs = [
  {
    q: 'Do customers need to download an app or register an account?',
    a: 'No app download is ever required! Customers simply open their standard iOS or Android camera app, point it at the tabletop standee QR code, and your digital menu opens instantly in mobile Safari or Chrome. Guests can place orders and settle bills in under 3 seconds without typing passwords.',
  },
  {
    q: 'How does the custom domain setup work? Can I use order.mybrand.com?',
    a: 'Yes, 100%! You or your client add a single CNAME record (e.g. `order` pointing to your server) in your domain registrar (GoDaddy, Cloudflare, Namecheap, Hostinger). QuickServe automatically provisions free SSL encryption and routes visitors straight to your branded menu.',
  },
  {
    q: 'Do you hold restaurant funds or take any percentage cut on orders?',
    a: 'Never! We charge 0% commission on orders. All online customer payments go directly from customer to your restaurant bank account via dynamic UPI or your connected Cashfree Merchant Account. QuickServe does not hold escrow funds.',
  },
  {
    q: 'Can one restaurant use all 3 channels (Dine-In, Corporate, and Takeaway)?',
    a: 'Yes! QuickServe natively unifies all three channels. You can generate cryptographically signed QR standees for your dining tables, corporate desk delivery QRs for nearby office parks (e.g. WeWork, Google), and post a takeaway pickup link in your social media bio.',
  },
  {
    q: 'What hardware is required for the Kitchen Display System (KDS)?',
    a: 'Any device with an internet browser works! You can use an iPad, an inexpensive Android tablet, a kitchen wall TV, a laptop, or an existing POS monitor. When a customer places an order, the screen updates in real time with an acoustic chime sound.',
  },
  {
    q: 'Can I use this for sweet shops, bakeries, cafes, or multiple food counters?',
    a: 'Yes, absolutely! QuickServe is built for all food operations. Whether you are running a sit-down dining restaurant with table standees, an espresso coffee bar, a mithai sweet shop with rapid token pickups, or a multi-brand cloud kitchen, you can customize your digital menu, categories, and direct UPI payments in minutes.',
  },
  {
    q: 'How do the promotional offers prevent coupon fraud and abuse?',
    a: 'All coupons validate against the customer’s phone number. For example, "1st Order Only" coupons verify that the phone number has 0 prior orders in the database. "Max 1x per user" coupons block repeat redemptions on the same mobile number.',
  },
];

const FaqSection = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 px-6 sm:px-12 max-w-4xl mx-auto border-t border-slate-900/80">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-outfit">
          Frequently Asked Questions
        </h2>
        <p className="text-sm sm:text-base text-slate-400">
          Everything you need to know about setting up your digital QR menu platform.
        </p>
      </div>

      {/* Accordion */}
      <div className="mt-8 space-y-3 text-left">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen
                  ? 'bg-slate-900 border-slate-700 shadow-md'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-bold text-white font-outfit">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-brand-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FaqSection;
