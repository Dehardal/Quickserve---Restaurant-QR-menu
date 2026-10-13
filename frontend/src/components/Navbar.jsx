import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { User, ShieldCheck } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const isSocketConnected = socket?.connected || false;

  return (
    <header className="h-20 glass-topbar px-8 flex items-center justify-between z-10 shrink-0 select-none">
      {/* Title / Breadcrumbs */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-extrabold tracking-tight text-slate-800">{title || 'Console Dashboard'}</h1>
        <span className="h-3.5 w-[1px] bg-slate-200"></span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Workspace</span>
      </div>

      {/* User Actions & Sockets indicator */}
      <div className="flex items-center gap-5">
        {/* Real-time status dot */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
          <span className={`w-1.5 h-1.5 rounded-full ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">
            {isSocketConnected ? 'Live pipeline' : 'offline'}
          </span>
        </div>

        {/* User profile capsule */}
        {user && (
          <div className="flex items-center gap-3 border-l border-slate-100 pl-5">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 leading-tight">{user.name}</span>
              <span className="text-[9px] font-semibold text-brand-600 uppercase tracking-wide flex items-center gap-0.5 self-end mt-0.5 leading-none">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                Store Owner
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm shrink-0">
              <User className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
