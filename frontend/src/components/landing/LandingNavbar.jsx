import React, { useState, useEffect } from 'react';
import '../../styles/landing/navbar.css';
import { Link } from 'react-router-dom';
import { Utensils, Menu, X, ArrowRight, Play, LayoutDashboard, Server } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Home', href: '#top' },
  { label: 'Features', href: '#features' },
  { label: 'Channels', href: '#channels' },
  { label: 'Why Direct', href: '#comparison' },
  { label: 'FAQ', href: '#faq' },
];

const LandingNavbar = ({ onOpenDemo }) => {
  const { token, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('#top');

  const isLoggedIn = Boolean(token && user);
  const dashboardPath = user?.role === 'superadmin' ? '/agency' : '/dashboard';
  const dashboardLabel = user?.role === 'superadmin' ? 'Agency Tower' : 'Dashboard Console';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setActiveHash(href);
    setMobileMenuOpen(false);

    if (href === '#top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      const topOffset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 landing-navbar-container ${
        scrolled
          ? 'landing-navbar-scrolled'
          : 'bg-slate-50/80 backdrop-blur-md border-b border-slate-200/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={(e) => handleNavClick(e, '#top')}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
            <Utensils className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base tracking-tight text-slate-900 leading-none font-outfit">
              QuickServe
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-brand-600 mt-0.5 leading-none">
              Digital Menu Engine
            </span>
          </div>
        </Link>

        {/* 5 Compact Nav Links with Hover Pill Indicator */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/90 shadow-inner">
          {navItems.map((item) => {
            const isActive = activeHash === item.href;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`nav-pill-link ${
                  isActive
                    ? 'text-brand-600 bg-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Live Customer Menu Simulator */}
          <button
            onClick={onOpenDemo}
            className="nav-demo-btn px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            title="Preview customer mobile menu simulator"
          >
            <Play className="w-3 h-3 text-brand-600 fill-brand-600" />
            <span>Live Demo</span>
          </button>

          {isLoggedIn ? (
            <Link
              to={dashboardPath}
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition flex items-center gap-1.5 transform hover:-translate-y-0.5"
            >
              {user?.role === 'superadmin' ? (
                <Server className="w-3.5 h-3.5" />
              ) : (
                <LayoutDashboard className="w-3.5 h-3.5" />
              )}
              <span>{dashboardLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition flex items-center gap-1 transform hover:-translate-y-0.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-slate-200 px-6 py-5 space-y-4 animate-slide-up shadow-xl">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="py-2 px-3 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-xl transition"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo();
              }}
              className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />
              <span>Interactive Customer Demo</span>
            </button>

            {isLoggedIn ? (
              <Link
                to={dashboardPath}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-bold text-white bg-brand-600 rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to {dashboardLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold text-white bg-brand-600 rounded-xl shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
