import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { Utensils, Mail, Lock, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, token, user } = useAuth();
  const { tenant, isWhiteLabelTenant } = useTenant();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.role === 'superadmin') {
        navigate('/agency');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.message || 'Failed to authenticate.');
    }
  };

  const primaryColor = tenant?.branding?.primaryColor || '#4f46e5';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background ambient decor */}
      <div className="absolute top-0 left-0 right-0 h-[320px] bg-gradient-to-b from-brand-50/50 to-transparent -z-10"></div>
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-brand-50/40 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

      <div className="w-full max-w-md flex flex-col gap-3 relative z-10">
        {/* Return to Home / Custom Domain */}
        <div className="flex items-center justify-between px-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isWhiteLabelTenant ? 'Return to Menu' : 'Back to QuickServe Home'}</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Secure SSL Staff Gateway
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-premium flex flex-col gap-6 animate-slide-up">
          {/* White-label or Master Branding header */}
          <div className="flex flex-col items-center gap-3">
            {tenant?.logo ? (
              <img
                src={tenant.logo}
                alt=""
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm bg-white"
              />
            ) : (
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/10 text-white font-black text-lg bg-brand-600"
                style={tenant?.branding?.primaryColor ? { backgroundColor: primaryColor } : {}}
              >
                <Utensils className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="text-center">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                {tenant?.name ? `${tenant.name} Staff Portal` : 'Sign in to Console'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {tenant?.name
                  ? 'Authorized restaurant manager & staff access'
                  : 'Digital Menu & Kitchen Management Platform'}
              </p>
            </div>
          </div>

          {/* Already logged in helper card */}
          {token && user && (
            <div className="bg-brand-50/80 border border-brand-100 p-3.5 rounded-xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-brand-900 block truncate">
                  Active session: {user.name}
                </span>
                <span className="text-[10px] text-brand-700 block truncate">
                  Role: {user.role === 'superadmin' ? 'Super Admin' : 'Store Owner'}
                </span>
              </div>
              <Link
                to={user.role === 'superadmin' ? '/agency' : '/dashboard'}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold rounded-lg transition shrink-0 shadow-sm"
              >
                Go to Console →
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
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@restaurant.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer flex items-center justify-center p-0.5 rounded-md hover:bg-slate-100"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md shadow-brand-500/10 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer bg-brand-600 hover:bg-brand-700"
            style={tenant?.branding?.primaryColor ? { backgroundColor: primaryColor } : {}}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Dynamic footer based on custom domain */}
        {isWhiteLabelTenant ? (
          <div className="text-center pt-2 border-t border-slate-100">
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer Menu
            </Link>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-500 font-medium">
            New store setup?{' '}
            <Link to="/signup" className="text-brand-600 hover:underline font-bold transition-all">
              Register store
            </Link>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default Login;
