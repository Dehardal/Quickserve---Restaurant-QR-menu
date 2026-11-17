import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Mail, Lock, User, Store, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const { register, token, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !restaurantName) {
      setError('Please fill in all the required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await register(name, email, password, restaurantName);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Failed to register account.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background soft ambient decor */}
      <div className="absolute top-0 left-0 right-0 h-[320px] bg-gradient-to-b from-brand-50/50 to-transparent -z-10"></div>
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-brand-50/30 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

      <div className="w-full max-w-md flex flex-col gap-3 relative z-10">
        {/* Return to Home */}
        <div className="flex items-center justify-between px-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to QuickServe Home</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            14-Day Free Trial
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-premium flex flex-col gap-6 animate-slide-up">
          {/* Branding header */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-md shadow-brand-500/10">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Create your account</h2>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">Start your digital QR menu SaaS journey</p>
            </div>
          </div>

          {/* Already logged in alert */}
          {token && user && (
            <div className="bg-brand-50/80 border border-brand-100 p-3.5 rounded-xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-brand-900 block truncate">
                  Logged in as {user.name}
                </span>
                <span className="text-[10px] text-brand-700 block truncate">
                  {user.email}
                </span>
              </div>
              <Link
                to={user.role === 'superadmin' ? '/agency' : '/dashboard'}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold rounded-lg transition shrink-0 shadow-sm"
              >
                Open Dashboard →
              </Link>
            </div>
          )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 surface-input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Restaurant Name</label>
            <div className="relative">
              <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="Gourmet Bistro"
                className="w-full pl-10 pr-4 py-2.5 surface-input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@myrestaurant.com"
                className="w-full pl-10 pr-4 py-2.5 surface-input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 6 characters)"
                className="w-full pl-10 pr-4 py-2.5 surface-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md shadow-brand-500/10 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Get Started Free</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:underline font-bold transition-all">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  </div>
);
};

export default Signup;
