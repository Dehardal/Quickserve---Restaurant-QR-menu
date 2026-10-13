import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Utensils, 
  Tag, 
  QrCode, 
  User, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { logout, restaurant } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/orders', icon: ClipboardList },
    { name: 'Categories', path: '/categories', icon: Tag },
    { name: 'Menu Items', path: '/dishes', icon: Utensils },
    { name: 'QR Code Generator', path: '/qr-center', icon: QrCode },
    { name: 'Settings', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-white flex flex-col border-r border-slate-200/60 shrink-0 select-none">
      {/* Branding Logo Area */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-md shadow-brand-500/10 shrink-0">
          <Utensils className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">QuickServe</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mt-1 leading-none">Saas MVP Console</span>
        </div>
      </div>

      {/* Restaurant quick stats banner */}
      {restaurant && (
        <div className="mx-4 my-4 p-3 bg-slate-50 border border-slate-150/60 rounded-xl flex items-center gap-3 shrink-0">
          {restaurant.logo ? (
            <img 
              src={restaurant.logo} 
              alt="Logo" 
              className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-white"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-brand-600 text-sm">
              {restaurant.name ? restaurant.name[0].toUpperCase() : 'R'}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-800 truncate leading-tight">{restaurant.name}</span>
            <span className="text-[9px] font-semibold text-slate-400 truncate mt-0.5 leading-none">{restaurant.contactNumber}</span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group duration-150 border ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 border-brand-100 shadow-sm'
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

      {/* Bottom User Logouts */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/40">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all duration-150"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
