import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Film,
  LayoutDashboard,
  Clapperboard,
  Ticket,
  Users,
  Tags,
  MapPin,
  Building2,
  MonitorPlay,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Categories', path: '/admin/movie-categories', icon: Tags },
    { name: 'Movies', path: '/admin/movies', icon: Clapperboard },
    { name: 'Locations', path: '/admin/locations', icon: MapPin },
    { name: 'Theaters', path: '/admin/theaters', icon: Building2 },
    { name: 'Screens', path: '/admin/screens', icon: MonitorPlay },
    { name: 'Bookings', path: '/admin/bookings', icon: Ticket },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-[#101014] border-r border-white/10 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Top Section */}
      <div>
        {/* Brand */}
        <div className="h-18 px-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-[#E50914] flex items-center justify-center shadow-lg shadow-[#E50914]/30">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white uppercase">
              CINEMA<span className="text-[#E50914]">TIQUE</span>
            </h1>
            <span className="text-[10px] font-bold tracking-widest text-[#E50914] uppercase">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                  active ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeAdminNav"
                    className="absolute inset-0 bg-[#E50914] rounded-xl shadow-md shadow-[#E50914]/25 z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  <span>{item.name}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Back to Public Site */}
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span>View Public Site</span>
        </Link>

        {/* User Card */}
        {user && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt={user.username}
                className="w-8 h-8 rounded-lg object-cover border border-[#E50914]"
              />
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user.username}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
