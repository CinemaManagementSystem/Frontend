import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Sidebar } from '@/components/common/Sidebar/Sidebar';
import { LogoutModal } from '@/components/common/LogoutModal/LogoutModal';
import {
  Bell,
  ChevronDown,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/components/ui/Toast/Toast';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar/Avatar';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Super Admin',
  STAFF: 'Staff',
  USER: 'Member',
};

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutAsync, isLoggingOut } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const toast = useToast();

  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

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
    return titles[location.pathname] || 'Dashboard';
  };

  const handleLogout = async () => {
    await logoutAsync();
    setLogoutOpen(false);
    setProfileOpen(false);
    toast.success('Successfully logged out');
    navigate('/login');
  };

  const roleLabel = ROLE_LABELS[user?.role ?? 'USER'] ?? 'Member';

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
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl bg-muted border border-border hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="relative p-2 rounded-xl bg-muted border border-border hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E50914]" />
            </button>

            {user && (
              <div className="relative pl-3 border-l border-slate-200 dark:border-white/10">
                <div className="flex h-11 items-center rounded-xl transition hover:bg-muted focus-within:ring-2 focus-within:ring-[#E50914]">
                  <Link
                    to="/admin/settings"
                    className="flex min-w-0 items-center gap-2 rounded-l-xl py-1.5 pl-1.5 pr-2 focus:outline-none"
                    title="Open profile settings"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.username}
                      className="h-8 w-8 border border-[#E50914]"
                    />
                    <span className="hidden max-w-[110px] truncate text-xs font-semibold leading-none text-muted-foreground md:inline-block">
                      {user.name ?? user.username}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setProfileOpen((open) => !open)}
                    aria-label="Open account menu"
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                    className="flex h-full w-8 items-center justify-center rounded-r-xl text-muted-foreground transition hover:text-foreground focus:outline-none"
                  >
                    <ChevronDown
                      className={cn('h-3.5 w-3.5 transition-transform', profileOpen && 'rotate-180')}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -8, scale: shouldReduceMotion ? 1 : 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8, scale: shouldReduceMotion ? 1 : 0.97 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-2xl border border-border bg-popover p-2 text-foreground shadow-2xl shadow-black/40"
                        role="menu"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate('/admin/settings');
                          }}
                          className="mb-1 flex w-full items-center gap-3 rounded-xl border-b border-border px-3 py-3 text-left transition hover:bg-muted"
                          role="menuitem"
                        >
                          <Avatar
                            src={user.avatar}
                            alt={user.username}
                            className="h-11 w-11 border border-[#E50914]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-foreground">{user.name ?? user.username}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#E50914]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#E50914]">
                              <ShieldCheck className="h-3 w-3" />
                              {roleLabel}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            navigate('/admin/settings');
                          }}
                          role="menuitem"
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-foreground transition hover:bg-muted"
                        >
                          <UserIcon className="h-4 w-4 text-[#E50914]" />
                          My Profile
                        </button>

                        <button
                          type="button"
                          onClick={toggleTheme}
                          role="menuitem"
                          className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-foreground transition hover:bg-muted"
                        >
                          <span className="flex items-center gap-2.5">
                            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-500" />}
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {theme}
                          </span>
                        </button>

                        <div className="my-1 border-t border-border" />

                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            setLogoutOpen(true);
                          }}
                          role="menuitem"
                          className="flex w-full items-center gap-2.5 rounded-lg bg-rose-500/10 px-3 py-2.5 text-left text-xs font-bold text-rose-500 transition hover:bg-rose-500/20"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto relative overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              className="w-full"
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
