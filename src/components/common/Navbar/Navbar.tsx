import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, Search, Ticket, Menu, X, Shield, LogOut, Sun, Moon, Settings, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage, type Locale } from '@/i18n';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const toggleLang = () => setLangDropdownOpen(!langDropdownOpen);
  const switchLang = (l: Locale) => { setLocale(l); setLangDropdownOpen(false); };

  const navLinks = [
    { name: t('nav.home'), key: 'nav.home', path: '/' },
    { name: t('nav.movies'), key: 'nav.movies', path: '/movies' },
    { name: t('nav.cinemas'), key: 'nav.cinemas', path: '/cinemas' },
    { name: t('nav.comingSoon'), key: 'nav.comingSoon', path: '/coming-soon' },
    { name: t('nav.offers'), key: 'nav.offers', path: '/offers' },
    { name: t('nav.myTickets'), key: 'nav.myTickets', path: '/history' },
    { name: t('nav.settings'), key: 'nav.settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#E50914] flex items-center justify-center shadow-lg shadow-[#E50914]/30 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-wider text-white uppercase group-hover:text-[#E50914] transition-colors">
            CINEMA<span className="text-[#E50914]">TIQUE</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'text-foreground bg-accent/10 shadow-inner'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Admin link badge */}
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin/dashboard"
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30 hover:bg-[#E50914] hover:text-white transition-all shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              {t('nav.adminPanel')}
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language Toggle */}
          <div className="relative">
            <button
              onClick={toggleLang}
              title={t('nav.language')}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors flex items-center gap-1"
            >
              <Languages className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">{locale === 'en' ? 'EN' : 'KM'}</span>
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
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => navigate('/movies')}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
            title={t('nav.searchMovies')}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Auth Button or User Menu */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-accent/10 border border-border hover:border-accent/40 transition-colors"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={user.username}
                  className="w-7 h-7 rounded-full object-cover border border-[#E50914]"
                />
                <span className="text-xs font-medium text-foreground max-w-[100px] truncate">
                  {user.username}
                </span>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl p-2 z-50 origin-top-right"
                  >
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-xs font-semibold text-foreground">{user.username}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#E50914]/20 text-[#E50914]">
                        {user.role} Role
                      </span>
                    </div>

                    {user.role === 'ADMIN' ? (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                      >
                        <Shield className="w-4 h-4 text-[#E50914]" />
                        {t('nav.adminDashboard')}
                      </Link>
                    ) : null}

                    <Link
                      to="/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-amber-400" />
                      {t('nav.myBookings')}
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      {t('nav.settings')}
                    </Link>

                    <div className="border-t border-border my-1 pt-1">
                      <button
                        onClick={() => { logout(); setUserDropdownOpen(false); }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.signOut')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-foreground hover:text-[#E50914] transition-colors"
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-[#E50914] hover:bg-[#ff1f2d] text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-[#E50914]/30"
              >
                {t('nav.joinNow')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {/* Language Toggle (mobile) */}
          <button
            onClick={toggleLang}
            title={t('nav.language')}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 text-xs font-bold"
          >
            {locale === 'en' ? 'EN' : 'KM'}
          </button>

          {/* Theme Toggle (mobile) */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden glass-nav border-t border-border px-4 py-4 space-y-2 overflow-hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10"
              >
                {link.name}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-[#E50914] bg-[#E50914]/10"
              >
                {t('nav.adminPanel')}
              </Link>
            )}

            {/* Mobile Language Switcher */}
            <div className="border-t border-border pt-3">
              <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{t('nav.language')}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { switchLang('en'); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${locale === 'en' ? 'bg-accent/10 text-foreground border border-border' : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'}`}
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => { switchLang('km'); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${locale === 'km' ? 'bg-accent/10 text-foreground border border-border' : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'}`}
                >
                  🇰🇭 ខ្មែរ
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-400"
                >
                  {t('nav.signOut')} ({user?.username})
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-[#E50914] text-white text-xs font-bold"
                >
                  {t('nav.signIn')}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
