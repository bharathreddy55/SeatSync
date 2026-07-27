import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, LogOut, User, LayoutDashboard, Calendar } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 shadow-lg">
      <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 tracking-wider">
        <Ticket className="h-7 w-7 text-emerald-400 animate-pulse" />
        SEAT<span className="text-white">SYNC</span>
      </Link>
      
      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link to="/" className="flex items-center gap-1.5 text-gray-300 hover:text-emerald-400 transition-colors font-medium">
              <Calendar className="h-4 w-4" /> Events
            </Link>
            <Link to="/bookings" className="flex items-center gap-1.5 text-gray-300 hover:text-emerald-400 transition-colors font-medium">
              <Ticket className="h-4 w-4" /> Bookings
            </Link>
            
            {user.role === 'ADMIN' && (
              <Link to="/admin" className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors font-medium bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <LayoutDashboard className="h-4 w-4" /> Admin
              </Link>
            )}

            <div className="h-4 w-[1px] bg-white/10" />

            <div className="flex items-center gap-2 text-gray-300">
              <User className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold text-sm max-w-[120px] truncate">{user.name}</span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors font-semibold text-sm cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white font-medium">Login</Link>
            <Link to="/register" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
