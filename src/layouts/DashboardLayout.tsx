import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Sidebar } from '@/components/common/Sidebar/Sidebar';
import { Bell, ShieldCheck, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin/dashboard':
        return 'Overview & Analytics';
      case '/admin/movie-categories':
        return 'Movie Categories';
      case '/admin/movies':
        return 'Movie Catalog Manager';
      case '/admin/locations':
        return 'Cinema Locations';
      case '/admin/theaters':
        return 'Theaters';
      case '/admin/screens':
        return 'Screens';
      case '/admin/seats':
        return 'Seats';
      case '/admin/shows':
        return 'Show Schedules';
      case '/admin/bookings':
        return 'Bookings & Orders';
      case '/admin/booking-seats':
        return 'Booking Seats';
      case '/admin/product-categories':
        return 'Product Categories';
      case '/admin/products':
        return 'Products';
      case '/admin/orders':
        return 'Orders';
      case '/admin/order-items':
        return 'Order Items';
      case '/admin/payments':
        return 'Payments';
      case '/admin/payment-transactions':
        return 'Payment Transactions';
      case '/admin/users':
        return 'User Management';
      default:
        return 'Admin Dashboard';
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-[#E50914] selection:text-white">
      {/* Admin Sidebar */}
      <Sidebar />

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-18 px-6 border-b border-border flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-30">
          <div>
            <h2 className="text-base font-bold text-foreground tracking-wide">
              {getPageTitle()}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Manage theater schedules, movies, and box office sales
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live System</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl bg-muted border border-border hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification */}
            <button className="relative p-2 rounded-xl bg-muted border border-border hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E50914]" />
            </button>

            {/* Admin Badge */}
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-7 h-7 rounded-lg bg-[#E50914]/20 border border-[#E50914]/40 flex items-center justify-center text-[#E50914]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground hidden md:inline-block">
                {user?.username || 'Administrator'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
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
    </div>
  );
};
