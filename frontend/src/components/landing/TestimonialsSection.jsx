import React from 'react';
import { Star, Quote, Building2, Store, Utensils } from 'lucide-react';

const testimonials = [
  {
    name: 'Vikram Malhotra',
    role: 'Founder & Head Chef',
    restaurant: 'The Roastery Artisan Cafe, Bangalore',
    icon: Store,
    rating: 5,
    quote:
      'Our table turnover speed jumped 35% on weekend evenings. Diners love scanning and paying via UPI without waiting for busy servers. Keeping 100% of our ticket volume without aggregator commissions saved us over ₹82,000 in our first month alone.',
    metric: 'Saved ₹82,000 in Month 1',
  },
  {
    name: 'Ananya Deshmukh',
    role: 'Director of Operations',
    restaurant: 'Crave Hub Cloud Kitchens, Hyderabad',
    icon: Building2,
    rating: 5,
    quote:
      'We run 4 distinct cloud kitchen brands. QuickServe’s custom domain engine allowed us to route order.thesmashburger.in and order.wokexpress.com seamlessly on a single setup. The live KDS audio chime completely eliminated lost kitchen tickets.',
    metric: '4 Brands on 1 Server',
  },
  {
    name: 'Sunil Aggarwal',
    role: 'Managing Partner',
    restaurant: 'Aggarwal Sweets & Chaat Bhandar, Delhi',
    icon: Utensils,
    rating: 5,
    quote:
      'During festive seasons and evening rushes, our billing counters used to face 20-person long queues. With QuickServe QR token billing, customers scan, pay directly via UPI, and collect their sweet gift boxes in seconds. Cash handling errors dropped to zero.',
    metric: 'Zero Counter Queues at Rush Hours',
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-12 sm:py-16 px-6 sm:px-12 max-w-7xl mx-auto border-t border-slate-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-outfit">
          Loved by Restaurants That Value Direct Revenue
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          Join hundreds of cafe owners, sweet shop founders, cloud kitchens, and dine-in restaurants who took control of their customer relationships.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 text-left">
        {testimonials.map((t, idx) => {
          const Icon = t.icon;
          return (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-brand-200 transition-all flex flex-col justify-between shadow-soft hover:shadow-lg relative group"
            >
              <div className="space-y-4">
                {/* Rating Stars & Metric Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                    {t.metric}
                  </span>
                </div>

                {/* Quote text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Author info */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center font-bold">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-outfit">{t.name}</h4>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                  <p className="text-[10px] text-brand-600 font-semibold">{t.restaurant}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TestimonialsSection;
