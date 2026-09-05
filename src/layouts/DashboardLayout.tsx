import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Sidebar } from '@/components/common/Sidebar/Sidebar';
import { Bell, ShieldCheck, Moon, Sun, Languages } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage, type Locale } from '@/i18n';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const switchLang = (l: Locale) => {
    setLocale(l);
    setLangDropdownOpen(false);
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin/dashboard':
        return t('dashboard.overview');
      case '/admin/movie-categories':
        return t('sidebar.categories');
      case '/admin/movies':
        return t('sidebar.movies');
      case '/admin/locations':
        return t('sidebar.locations');
      case '/admin/theaters':
        return t('sidebar.theaters');
      case '/admin/screens':
        return t('sidebar.screens');
      case '/admin/seats':
        return t('sidebar.seats');
      case '/admin/shows':
        return t('sidebar.shows');
      case '/admin/bookings':
        return t('sidebar.bookings');
      case '/admin/booking-seats':
        return t('sidebar.bookingSeats');
      case '/admin/product-categories':
        return t('sidebar.productCategories');
      case '/admin/products':
        return t('sidebar.products');
      case '/admin/orders':
        return t('sidebar.orders');
      case '/admin/order-items':
        return t('sidebar.orderItems');
      case '/admin/payments':
        return t('sidebar.payments');
      case '/admin/payment-transactions':
        return t('sidebar.paymentTransactions');
      case '/admin/users':
        return t('sidebar.users');
      default:
        return t('sidebar.dashboard');
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
              {t('dashboard.manage')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('dashboard.liveSystem')}</span>
            </div>

            {/* Language Toggle */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                title={t('nav.language')}
                className="flex items-center gap-1 p-2 rounded-xl bg-muted border border-border hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Languages className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">{locale === 'en' ? 'EN' : 'KM'}</span>
              </button>
              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2 w-32 bg-card border border-border rounded-xl shadow-2xl p-1.5 z-50"
                  >
                    <button
                      onClick={() => switchLang('en')}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors ${
                        locale === 'en' ? 'bg-accent/10 text-foreground font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                      }`}
                    >
                      <span className="text-base leading-none">🇬🇧</span> English
                    </button>
                    <button
                      onClick={() => switchLang('km')}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors ${
                        locale === 'km' ? 'bg-accent/10 text-foreground font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                      }`}
                    >
                      <span className="text-base leading-none">🇰🇭</span> ខ្មែរ
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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
