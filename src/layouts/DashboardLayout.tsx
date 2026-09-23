import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Sidebar } from '@/components/common/Sidebar/Sidebar';
import { LogoutModal } from '@/components/common/LogoutModal/LogoutModal';
import {
  Activity,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Shield,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/Toast/Toast';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar/Avatar';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  STAFF: 'Staff Member',
  USER: 'Member',
};

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutAsync, isLoggingOut } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();
  const toast = useToast();

  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on route change
  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      '/admin/dashboard': 'Overview & Analytics',
      '/admin/movie-categories': 'Categories',
      '/admin/movies': 'Movies',
      '/admin/locations': 'Locations',
      '/admin/theaters': 'Theaters',
      '/admin/screens': 'Screens',
      '/admin/seats': 'Seats',
      '/admin/shows': 'Shows',
      '/admin/bookings': 'Bookings',
      '/admin/booking-seats': 'Booking Seats',
      '/admin/product-categories': 'Product Categories',
      '/admin/products': 'Products',
      '/admin/orders': 'Orders',
      '/admin/order-items': 'Order Items',
      '/admin/payments': 'Payments',
      '/admin/payment-transactions': 'Payment Transactions',
      '/admin/users': 'Users',
      '/admin/audit-logs': 'Security & Audit Log',
      '/admin/settings': 'Settings',
    };
    if (location.pathname.endsWith('/create')) {
      const base = titles[location.pathname.replace(/\/create$/, '')];
      if (base) return `Add New ${base.replace(/s$/, '')}`;
    }
    return titles[location.pathname] || 'Dashboard';
  };

  const handleLogout = async () => {
    await logoutAsync();
    setLogoutOpen(false);
    setProfileOpen(false);
    toast.success('Successfully logged out');
    navigate('/login');
  };

  const roleLabel = ROLE_LABELS[user?.role ?? 'ADMIN'] ?? 'Administrator';

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-[#E50914] selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-18 px-6 border-b border-border flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-30">
          <div>
            <h2 className="text-base font-bold text-foreground tracking-wide">{getPageTitle()}</h2>
            <p className="text-[11px] text-muted-foreground">Manage theater schedules, movies, and box office sales</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live System</span>
            </div>
            <button className="relative p-2 rounded-xl bg-muted border border-border hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E50914]" />
            </button>

            {user && (
              <div ref={dropdownRef} className="relative pl-3 border-l border-border">
                {/* Profile Trigger Button */}
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className={cn(
                    'flex items-center gap-2.5 p-1.5 rounded-xl border border-transparent transition-all cursor-pointer',
                    'hover:bg-muted hover:border-border focus:outline-none focus:ring-2 focus:ring-[#E50914]/30',
                    profileOpen && 'bg-muted border-border ring-2 ring-[#E50914]/30',
                  )}
                  aria-label="Open admin profile menu"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                >
                  <Avatar
                    src={user.avatar}
                    alt={user.username}
                    className="h-8 w-8 border-2 border-[#E50914]/80 shadow-sm shrink-0"
                  />
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-foreground leading-tight truncate max-w-[120px]">
                      {user.name ?? user.username}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {roleLabel}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0',
                      profileOpen && 'rotate-180 text-foreground',
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: shouldReduceMotion ? 0 : -6,
                        scale: shouldReduceMotion ? 1 : 0.96,
                      }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{
                        opacity: 0,
                        y: shouldReduceMotion ? 0 : -6,
                        scale: shouldReduceMotion ? 1 : 0.96,
                      }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-72 origin-top-right rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-2 text-foreground shadow-2xl shadow-black/60 z-50"
                      role="menu"
                    >
                      {/* Header: Avatar, display name, email, role badge */}
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/50 mb-1">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.avatar}
                            alt={user.username}
                            className="h-11 w-11 border-2 border-[#E50914] shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-foreground leading-snug">
                              {user.name ?? user.username}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {user.email || 'admin@cinematique.com'}
                            </p>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#E50914]/15 border border-[#E50914]/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#E50914]">
                                <ShieldCheck className="h-3 w-3" />
                                {roleLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-border my-1" />

                      {/* Menu items with icons */}
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate('/admin/settings');
                          }}
                          role="menuitem"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-foreground transition hover:bg-muted hover:text-white group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center group-hover:bg-[#E50914]/15 transition-colors">
                            <UserIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[#E50914] transition-colors" />
                          </div>
                          <span>My Profile</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate('/admin/settings');
                          }}
                          role="menuitem"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-foreground transition hover:bg-muted hover:text-white group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center group-hover:bg-[#E50914]/15 transition-colors">
                            <Settings className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[#E50914] transition-colors" />
                          </div>
                          <span>Settings</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate('/admin/settings');
                          }}
                          role="menuitem"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-foreground transition hover:bg-muted hover:text-white group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center group-hover:bg-[#E50914]/15 transition-colors">
                            <Shield className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[#E50914] transition-colors" />
                          </div>
                          <span>Security</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate('/admin/audit-logs');
                          }}
                          role="menuitem"
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-foreground transition hover:bg-muted hover:text-white group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center group-hover:bg-[#E50914]/15 transition-colors">
                            <Activity className="h-3.5 w-3.5 text-muted-foreground group-hover:text-[#E50914] transition-colors" />
                          </div>
                          <span>Activity Log</span>
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-border my-1" />

                      {/* Sign Out in red */}
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setLogoutOpen(true);
                        }}
                        role="menuitem"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-rose-500 transition hover:bg-rose-500/10 hover:text-rose-400 group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                          <LogOut className="h-3.5 w-3.5 text-rose-500" />
                        </div>
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        <main className="relative flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              className="mx-auto w-full max-w-7xl min-w-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <LogoutModal
        isOpen={logoutOpen}
        isLoading={isLoggingOut}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};
