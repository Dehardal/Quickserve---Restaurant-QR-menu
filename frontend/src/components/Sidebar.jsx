import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Utensils, 
  Tag, 
  Ticket,
  QrCode, 
  User, 
  LogOut,
  Server,
  ExternalLink,
  Globe
} from 'lucide-react';

const Sidebar = () => {
  const { logout, restaurant, user } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = user?.role === 'superadmin';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Orders', path: '/orders', icon: ClipboardList },
    { name: 'Categories', path: '/categories', icon: Tag },
    { name: 'Menu Items', path: '/dishes', icon: Utensils },
    { name: 'Offers & Promos', path: '/offers', icon: Ticket },
    { name: 'Table QR Studio', path: '/qr-center', icon: QrCode },
    { name: 'Branding & Settings', path: '/profile', icon: User },
  ];

  if (isSuperAdmin) {
    menuItems.unshift({ name: 'Agency Console', path: '/agency', icon: Server });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-white flex flex-col border-r border-slate-200/60 shrink-0 select-none">
      {/* Dynamic White-Label Brand Area */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100">
        {restaurant?.logo ? (
          <img
            src={restaurant.logo}
            alt=""
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 text-white font-bold text-sm bg-brand-600"
            style={{ backgroundColor: restaurant?.branding?.primaryColor || '#4f46e5' }}
          >
            <Utensils className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-tight truncate">
            {restaurant?.name || 'Restaurant Portal'}
          </span>
          <span className="text-[10px] font-semibold text-slate-500 truncate mt-0.5 leading-tight">
            {restaurant?.customDomain || 'Staff Dashboard'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group duration-150 border ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 border-brand-100 shadow-sm font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border-transparent'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Launch & Logouts */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/40 space-y-1">
        {restaurant?._id && (
          <a
            href={`/menu/${restaurant._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-50/60 rounded-xl transition-all"
            title="Open Live Customer Menu in new tab"
          >
            <span className="flex items-center gap-2.5">
              <Utensils className="w-4 h-4 text-brand-500" />
              <span>Live Customer Menu</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
          </a>
        )}

        <Link
          to="/home"
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 rounded-xl transition-all"
          title="Visit SaaS Product Homepage"
        >
          <Globe className="w-4 h-4 text-slate-400" />
          <span>Product Homepage</span>
        </Link>

        <div className="pt-1 border-t border-slate-200/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all duration-150"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
