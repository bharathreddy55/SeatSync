import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, LogOut, LayoutDashboard, Calendar } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-panel sticky top-0 z-50 px-8 py-4 flex items-center justify-between border-b border-white/5 shadow-xl backdrop-blur-lg">
      <Link to="/" className="flex items-center gap-2.5 font-black text-2xl tracking-wide">
        <div className="relative">
          <Ticket className="h-8 w-8 text-emerald-400 rotate-12 transform hover:rotate-45 transition-transform duration-300" />
          <div className="absolute inset-0 bg-emerald-400/20 blur-sm rounded-lg" />
        </div>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 font-extrabold tracking-wider">
          SEAT<span className="text-white font-medium">SYNC</span>
        </span>
      </Link>
      
      <div className="flex items-center gap-8">
        {user ? (
          <>
            <Link 
              to="/" 
              className={`flex items-center gap-2 text-sm font-semibold transition-all duration-200 ${
                isActive('/') ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calendar className="h-4.5 w-4.5" /> Events
            </Link>
            <Link 
              to="/bookings" 
              className={`flex items-center gap-2 text-sm font-semibold transition-all duration-200 ${
                isActive('/bookings') ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Ticket className="h-4.5 w-4.5" /> My Bookings
            </Link>
            
            {user.role === 'ADMIN' && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 hover:text-amber-200 transition-all bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20 shadow-sm"
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Organizer Portal
              </Link>
            )}

            <div className="h-5 w-[1px] bg-white/10" />

            <div className="flex items-center gap-2.5 bg-white/5 border border-white/5 pl-2.5 pr-4 py-1.5 rounded-full shadow-inner">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-sm text-gray-200 max-w-[100px] truncate">{user.name}</span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-semibold text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5" /> Logout
            </button>
          </>
        ) : (
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="glow-btn bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all border border-emerald-400/20">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
