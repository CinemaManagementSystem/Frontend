import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  ChevronDown,
  Crown,
  Gift,
  Home,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Search,
  Shield,
  ShoppingBag,
  Sun,
  Ticket,
  User as UserIcon,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { useSettingsStore, type AppLanguage } from '@/store/settingsStore';
import { canAccessAdmin } from '@/lib/authRole';
import { cn } from '@/lib/utils';
import { SearchAutocomplete } from './SearchAutocomplete';
import { LogoutModal } from '@/components/common/LogoutModal/LogoutModal';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { CinematiqueLogo } from '@/components/common/CinematiqueLogo';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/context/ThemeContext';
import type { User } from '@/types/auth';
import './Navbar.css';

const NAV_LINKS = [
  { name: 'Home', path: '/', icon: Home, end: true },
  { name: 'Cinemas', path: '/cinemas', icon: MapPin, end: true },
  { name: 'Offers', path: '/promotion', icon: Gift, end: true },
  { name: 'F&B', path: '/fnb', icon: ShoppingBag, end: true },
  { name: 'Membership', path: '/membership', icon: Crown, end: true },
];

const LANGUAGE_OPTIONS: { value: AppLanguage; label: string; shortLabel: string; flag: string }[] = [
  { value: 'en', label: 'English', shortLabel: 'EN', flag: '🇬🇧' },
  { value: 'km', label: 'ភាសាខ្មែរ', shortLabel: 'KH', flag: '🇰🇭' },
];

const dropdownPanelClass =
  'absolute z-50 mt-2 origin-top rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl p-2 text-white shadow-2xl';

interface UserMenuProps {
  user: User;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutAsync, isLoggingOut } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const canViewAdminPanel = canAccessAdmin(user.role);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    await logoutAsync();
    setLogoutOpen(false);
    setOpen(false);
    navigate('/login');
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="avatar-pill"
        >
          <Avatar src={user.avatar} alt={user.username} className="h-6 w-6 border border-[var(--primary)]" />
          <span className="max-w-[90px] truncate">{user.username}</span>
          <ChevronDown className={cn('h-3.5 w-3.5 text-white/50 transition-transform', open && 'rotate-180')} />
        </button>

        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className={cn(dropdownPanelClass, 'right-0 top-full w-60')}
              >
                <div className="mb-1 flex items-center gap-2.5 border-b border-white/10 px-3 py-2.5">
                  <Avatar src={user.avatar} alt={user.username} className="h-9 w-9 border border-[var(--primary)]" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-white">{user.username}</p>
                    <p className="truncate text-[10px] text-white/50">{user.email}</p>
                    <span className="mt-0.5 inline-block rounded bg-[var(--primary)]/20 px-2 py-0.5 text-[9px] font-black uppercase text-[var(--primary)]">
                      {user.role}
                    </span>
                  </div>
                </div>

                {canViewAdminPanel && (
                  <button
                    type="button"
                    onClick={() => go('/admin/dashboard')}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-white hover:bg-white/5"
                  >
                    <Shield className="h-4 w-4 text-[var(--primary)]" />
                    Admin Dashboard
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => go('/settings')}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-white/80 hover:bg-white/5 hover:text-white"
                >
                  <UserIcon className="h-4 w-4 text-white/50" />
                  Profile & Settings
                </button>
                <button
                  type="button"
                  onClick={() => go('/history')}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-white/80 hover:bg-white/5 hover:text-white"
                >
                  <Ticket className="h-4 w-4 text-amber-400" />
                  My Tickets
                </button>

                <div className="my-1 border-t border-white/10 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setLogoutOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <LogoutModal
        isOpen={logoutOpen}
        isLoading={isLoggingOut}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

interface CinemaSelectorProps {
  onSelect: () => void;
  mobile?: boolean;
}

const CinemaSelector: React.FC<CinemaSelectorProps> = ({ onSelect, mobile = false }) => {
  const { cinemas, selectedCinemaId, loading, error, fetchCinemas, selectCinema } = useCinemaStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => { void fetchCinemas(); }, [fetchCinemas]);

  const selectedCinema = cinemas.find((cinema) => cinema.id === selectedCinemaId);
  const filteredCinemas = cinemas.filter((cinema) => {
    const value = `${cinema.name} ${cinema.city ?? ''}`.toLowerCase();
    return value.includes(query.trim().toLowerCase());
  });

  const handleSelect = (cinemaId: string) => {
    selectCinema(cinemaId);
    setOpen(false);
    setQuery('');
    onSelect();
  };

  return (
    <div className={cn('cinema-nav-picker', mobile && 'cinema-nav-picker--mobile')}>
      <div className="relative">
        <button
          type="button"
          className="cinema-nav-picker-control w-full text-left"
          aria-label="Choose a cinema"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={loading && cinemas.length === 0}
          onClick={() => setOpen((value) => !value)}
          onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">
            {loading && cinemas.length === 0 ? 'Loading cinemas...' : selectedCinema?.name ?? 'All Cinemas'}
          </span>
          <ChevronDown className={cn('h-3 w-3 shrink-0 text-white/50 transition-transform', open && 'rotate-180')} aria-hidden="true" />
        </button>

        {open && (
          <>
            <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close cinema selector" onClick={() => setOpen(false)} />
            <div className="cinema-nav-picker-menu" role="listbox" aria-label="Cinema locations">
              {cinemas.length > 8 && (
                <label className="cinema-nav-picker-search">
                  <Search className="h-3.5 w-3.5 text-white/40" aria-hidden="true" />
                  <span className="sr-only">Search cinemas</span>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cinemas" autoFocus />
                </label>
              )}
              <button type="button" role="option" aria-selected={selectedCinemaId === 'ALL'} className={cn('cinema-nav-picker-option', selectedCinemaId === 'ALL' && 'cinema-nav-picker-option-selected')} onClick={() => handleSelect('ALL')}>
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>All Cinemas</span>
              </button>
              {filteredCinemas.map((cinema) => (
                <button key={cinema.id} type="button" role="option" aria-selected={selectedCinemaId === cinema.id} className={cn('cinema-nav-picker-option', selectedCinemaId === cinema.id && 'cinema-nav-picker-option-selected')} onClick={() => handleSelect(cinema.id)}>
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span className="min-w-0 truncate">{cinema.name}{cinema.city ? ` · ${cinema.city}` : ''}</span>
                </button>
              ))}
              {filteredCinemas.length === 0 && <p className="px-3 py-4 text-xs text-white/45">No cinemas match that search.</p>}
            </div>
          </>
        )}
      </div>
      {error && (
        <p role="status" className="cinema-nav-picker-error">
          Cinema list unavailable. <button type="button" onClick={() => void fetchCinemas(true)} disabled={loading}>{loading ? 'Loading...' : 'Retry'}</button>
        </p>
      )}
      {!loading && !error && cinemas.length === 0 && (
        <p className="cinema-nav-picker-error" role="status">No cinemas available yet.</p>
      )}
    </div>
  );
};

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { language, setLanguage } = useSettingsStore();
  const { theme, toggleTheme } = useTheme();
  const selectedLanguageOption =
    LANGUAGE_OPTIONS.find((option) => option.value === language) ?? LANGUAGE_OPTIONS[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [languageOpen, setLanguageOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const languageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLanguageOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 40);
    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });
    return () => window.removeEventListener('scroll', updateScrolled);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!languageRef.current?.contains(event.target as Node)) setLanguageOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLanguageOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const closeMenus = () => {
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    closeMenus();
    navigate(`/movies?search=${encodeURIComponent(query.trim())}`);
  };

  const handleTicketClick = () => {
    closeMenus();
    navigate('/history');
  };

  const handleSuggestionSelect = (movieId: string) => {
    closeMenus();
    navigate(`/movies/${movieId}`);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 w-full text-white transition-colors duration-200',
        scrolled ? 'border-b border-white/10 bg-black/30 backdrop-blur-xl' : 'border-b border-white/10 bg-transparent',
      )}
    >
      {/* Row 1: Search | Logo | Actions */}
      <PageContainer className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Left: Search Bar */}
        <div className="flex min-w-0 items-center justify-start">
          <button
            type="button"
            onClick={() => navigate('/movies')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Search movies"
          >
            <Search className="h-4 w-4" />
          </button>
          <div className="hidden w-64 lg:block">
            <SearchAutocomplete
              size="sm"
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              onSelect={handleSuggestionSelect}
            />
          </div>
        </div>

        {/* Center: Brand Logo */}
        <Link
          to="/"
          onClick={closeMenus}
          className="flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="Legend Cinema Home"
        >
          <CinematiqueLogo className="h-7 w-auto object-contain md:h-10" />
        </Link>

          {/* Right: Actions (Ticket, User/Join, Bell, Language) */}
        <div className="flex min-w-0 items-center justify-end gap-3">
          {/* Ticket Button */}
          <button
            type="button"
            onClick={handleTicketClick}
            className="hidden h-10 items-center gap-2 rounded-full border border-white/10 bg-black/40 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:flex"
          >
            <Ticket className="h-4 w-4 text-white" />
            Ticket
          </button>

          {/* Account / Join Now */}
          {isAuthenticated && user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              to="/login"
              className="avatar-pill"
            >
              <UserIcon className="h-3.5 w-3.5 text-[var(--primary)]" />
              Join Now
            </Link>
          )}

          {/* Notifications Bell */}
          <button
            type="button"
            className="relative icon-btn-circle"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="notification-dot" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="hidden icon-btn-circle sm:flex"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-white" />}
          </button>

          {/* Language Selector */}
          <div ref={languageRef} className="relative hidden sm:block">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label="Select language"
              aria-haspopup="menu"
              aria-expanded={languageOpen}
              onClick={() => setLanguageOpen((open) => !open)}
            >
              <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full text-base leading-none" aria-hidden="true">
                {selectedLanguageOption.flag}
              </span>
              <span className="font-semibold uppercase">{selectedLanguageOption.shortLabel}</span>
              <ChevronDown className={cn('h-4 w-4 text-white/80 transition-transform', languageOpen && 'rotate-180')} />
            </button>
            {languageOpen && (
              <div
                className="absolute right-0 top-full z-[100] mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-black/90 p-1 text-white shadow-xl backdrop-blur-md"
                role="menu"
                aria-label="Language options"
              >
                {LANGUAGE_OPTIONS.map((option) => {
                  const selected = option.value === language;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setLanguage(option.value);
                        setLanguageOpen(false);
                      }}
                      className={cn(
                        'flex h-11 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm font-semibold transition-colors hover:bg-white/[0.06]',
                        selected ? 'text-[var(--primary)]' : 'text-white/85',
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full text-base leading-none" aria-hidden="true">
                          {option.flag}
                        </span>
                        <span className="truncate">{option.label}</span>
                      </span>
                      {selected && <Check className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white transition-colors hover:bg-white/10 lg:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </PageContainer>

      {/* Row 2: Nav Links | Cinema Selector */}
      <div className="hidden border-t border-white/10 lg:block">
        <PageContainer className="flex h-[52px] items-center justify-between">
          {/* Nav Links */}
          <nav className="flex items-center gap-8" aria-label="Public sub navigation">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 text-sm font-medium text-neutral-300 transition-colors md:text-[15px]',
                      isActive
                        ? 'font-bold text-white'
                        : 'hover:text-white'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('h-[18px] w-[18px]', isActive ? 'text-red-500' : '')} />
                      {link.name}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <CinemaSelector onSelect={closeMenus} />
        </PageContainer>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              aria-label="Close navigation menu"
              onClick={() => setMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed bottom-0 right-0 top-0 z-50 flex w-[min(360px,88vw)] flex-col border-l border-white/10 bg-black/95 p-4 pt-20 text-white shadow-2xl backdrop-blur-xl lg:hidden"
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 36 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-4">
                <SearchAutocomplete
                  size="sm"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSubmit={handleSearchSubmit}
                  onSelect={handleSuggestionSelect}
                />
              </div>

              <nav className="space-y-1" aria-label="Mobile public navigation">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      end={link.end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors',
                          isActive ? 'bg-white/5 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={cn('h-5 w-5', isActive && 'text-[var(--primary)]')} />
                          {link.name}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="mt-4 border-t border-white/10 pt-4">
                <CinemaSelector onSelect={closeMenus} mobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </header>
  );
};
