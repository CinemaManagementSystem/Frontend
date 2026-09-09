import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clapperboard,
  Crown,
  Film,
  Gift,
  Home,
  LogOut,
  MapPin,
  Menu,
  Play,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Ticket,
  User as UserIcon,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { canAccessAdmin } from '@/lib/authRole';
import { useMovieStore } from '@/store/movieStore';
import { cn } from '@/lib/utils';
import { SearchAutocomplete } from './SearchAutocomplete';
import type { User } from '@/types/auth';
import './Navbar.css';

const NAV_LINKS = [
  { name: 'Home', path: '/', icon: Home, end: true },
  { name: 'Cinemas', path: '/cinemas', icon: MapPin, end: true },
  { name: 'Offers', path: '/promotion', icon: Gift, end: true },
  { name: 'F&B', path: '/fnb', icon: ShoppingBag, end: true },
  { name: 'Membership', path: '/membership', icon: Crown, end: true },
];

const MOVIE_MENU_ITEMS = [
  { name: 'Now Showing', path: '/movies', icon: Play, description: 'Currently in theaters' },
  { name: 'Coming Soon', path: '/coming-soon', icon: CalendarDays, description: 'Upcoming releases' },
  { name: 'Premiere', path: '/premiere', icon: Sparkles, description: 'Member premieres & events' },
  { name: 'View All Movies', path: '/movies', icon: Clapperboard, description: 'Browse the full catalog' },
];

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';

const baseNavClass =
  'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]';
const navActiveClass = 'bg-[#E50914]/15 text-white shadow-[0_0_18px_rgba(229,9,20,0.12)]';
const navIdleClass = 'text-zinc-300 hover:bg-white/10 hover:text-white';
const navIconClass = (isActive: boolean) =>
  cn('h-4 w-4 transition', isActive ? 'text-[#E50914]' : 'text-slate-400 group-hover:text-[#E50914]');

const dropdownItemClass =
  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-200 transition hover:bg-white/10 hover:text-white';

const menuItemClass =
  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white';

interface UserMenuProps {
  user: User;
  compact?: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, compact = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);
  const canViewAdminPanel = canAccessAdmin(user.role);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center rounded-full border border-white/15 bg-[#211a1b]/80 backdrop-blur-md transition hover:border-[#E50914]/60 hover:bg-[#E50914]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]',
          compact ? 'h-10 w-10 justify-center p-0' : 'h-12 gap-2 py-1 pl-1 pr-4 text-sm font-bold text-white',
        )}
      >
        <img
          src={user.avatar || DEFAULT_AVATAR}
          alt={user.username}
          className={cn('rounded-full border border-[#E50914] object-cover', compact ? 'h-8 w-8' : 'h-9 w-9')}
        />
        {!compact && (
          <>
            <span className="max-w-[110px] truncate">{user.username}</span>
            <ChevronDown className={cn('h-4 w-4 text-slate-300 transition', open && 'rotate-180')} />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-2xl border border-white/10 bg-[#120d0e] p-2 text-white shadow-2xl shadow-black/50"
            >
              <div className="mb-1 flex items-center gap-2 border-b border-white/10 px-3 py-2">
                <img
                  src={user.avatar || DEFAULT_AVATAR}
                  alt={user.username}
                  className="h-9 w-9 rounded-full border border-[#E50914] object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white">{user.username}</p>
                  <p className="truncate text-[11px] text-zinc-400">{user.email}</p>
                  <span className="mt-1 inline-block rounded bg-[#E50914]/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#E50914]">
                    {user.role}
                  </span>
                </div>
              </div>

              {canViewAdminPanel && (
                <button type="button" onClick={() => go('/admin/dashboard')} className={menuItemClass}>
                  <Shield className="h-4 w-4 text-[#E50914]" />
                  Admin Dashboard
                </button>
              )}
              <button type="button" onClick={() => go('/settings')} className={menuItemClass}>
                <UserIcon className="h-4 w-4 text-[#E50914]" />
                Profile
              </button>
              <button type="button" onClick={() => go('/history')} className={menuItemClass}>
                <Ticket className="h-4 w-4 text-amber-400" />
                My Tickets
              </button>
              <button type="button" onClick={() => go('/history')} className={menuItemClass}>
                <CalendarDays className="h-4 w-4 text-[#E50914]" />
                Booking History
              </button>
              <button type="button" onClick={() => go('/settings')} className={menuItemClass}>
                <Settings className="h-4 w-4" />
                Settings
              </button>

              <div className="my-1 border-t border-border pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-rose-300 transition hover:bg-rose-500/10"
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
  );
};

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { searchQuery, setSearchQuery } = useMovieStore();
  const { locations, loading: locationsLoading, selectedLocationId, selectLocation } = useLocationStore();
  const canViewAdminPanel = canAccessAdmin(user?.role);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMoviesOpen, setMobileMoviesOpen] = useState(false);
  const [moviesDropdownOpen, setMoviesDropdownOpen] = useState(false);
  const [cinemaDropdownOpen, setCinemaDropdownOpen] = useState(false);

  useEffect(() => {
    useLocationStore.getState().fetchAll();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setMobileMoviesOpen(false);
    setMoviesDropdownOpen(false);
    setCinemaDropdownOpen(false);
  }, [location.pathname]);

  const isMoviesActive = location.pathname === '/movies' || location.pathname.startsWith('/movies/');
  const isHomePage = location.pathname === '/';
  const selectedCinema = locations.find((cinema) => cinema.id === selectedLocationId) ?? null;

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setMobileMoviesOpen(false);
    setMoviesDropdownOpen(false);
    setCinemaDropdownOpen(false);
  };

  const handleTicketClick = () => {
    navigate(isAuthenticated ? '/history' : '/login');
  };

  const handleSearchSubmit = (query: string) => {
    closeMenus();
    navigate(`/movies?search=${encodeURIComponent(query)}`);
  };

  const handleSuggestionSelect = (movieId: string) => {
    closeMenus();
    navigate(`/movies/${movieId}`);
  };

  return (
    <header
      className={cn(
        'top-0 z-40 isolate w-full overflow-visible border-b border-white/10 text-white backdrop-blur-xl',
        isHomePage
          ? 'absolute bg-black/25 shadow-none'
          : 'sticky bg-[#0b0809]/95 shadow-2xl shadow-black/40',
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 -z-10',
          isHomePage
            ? 'bg-[linear-gradient(180deg,rgba(0,0,0,0.78),rgba(20,6,8,0.52)_58%,rgba(0,0,0,0.18)),radial-gradient(circle_at_28%_0%,rgba(229,9,20,0.18),transparent_34%),radial-gradient(circle_at_72%_0%,rgba(255,255,255,0.06),transparent_30%)]'
            : 'bg-[radial-gradient(circle_at_32%_0%,rgba(229,9,20,0.20),transparent_32%),radial-gradient(circle_at_68%_0%,rgba(229,9,20,0.12),transparent_28%)]',
        )}
      />
      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-0">
        <div className="grid gap-4 py-5 lg:grid-cols-[minmax(260px,1fr)_auto_minmax(440px,1fr)] lg:items-center">
          {/* Mobile top bar */}
          <div className="flex items-center justify-between gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen((open) => !open);
                setMobileSearchOpen(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#211a1b]/80 text-white"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link
              to="/"
              onClick={closeMenus}
              className="flex items-center gap-2 rounded-full py-1 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
              aria-label="Go to Cinematique home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E50914] shadow-lg shadow-[#E50914]/35">
                <Film className="h-4 w-4" />
              </span>
              <span className="text-lg font-black uppercase tracking-wider">
                CINEMA<span className="text-[#E50914]">TIQUE</span>
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen((open) => !open);
                  setMobileMenuOpen(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#211a1b]/80 text-white"
                aria-label={mobileSearchOpen ? 'Close movie search' : 'Search movies'}
              >
                {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>

              {isAuthenticated && user ? (
                <UserMenu user={user} compact />
              ) : (
                <Link
                  to="/login"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#211a1b]/80 text-white"
                  aria-label="Sign in"
                >
                  <UserIcon className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Desktop search */}
          <div className="hidden w-full max-w-[280px] lg:block lg:justify-self-start">
            <SearchAutocomplete
              size="lg"
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              onSelect={handleSuggestionSelect}
            />
          </div>

          {/* Desktop logo */}
          <Link
            to="/"
            onClick={closeMenus}
            className="group hidden items-center justify-start gap-3 rounded-full py-2 text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] lg:flex lg:justify-self-center"
            aria-label="Go to Cinematique home"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E50914] shadow-lg shadow-[#E50914]/35 transition group-hover:scale-105">
              <Film className="h-5 w-5" />
            </span>
            <span className="text-2xl font-black uppercase tracking-wider">
              CINEMA<span className="text-[#E50914]">TIQUE</span>
            </span>
          </Link>

          {/* Desktop account actions */}
          <div className="hidden items-center justify-end gap-2 lg:flex">
            <button
              type="button"
              onClick={handleTicketClick}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-[#211a1b]/80 px-5 text-sm font-bold text-white backdrop-blur-md transition hover:border-[#E50914]/60 hover:bg-[#E50914]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
            >
              <Ticket className="h-4 w-4" />
              My Tickets
            </button>

            {isAuthenticated && user ? (
              <>
                <button
                  type="button"
                  className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#211a1b]/80 text-white backdrop-blur-md transition hover:border-[#E50914]/60 hover:bg-[#E50914]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#E50914]" />
                </button>
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center rounded-full px-4 text-sm font-bold text-white transition hover:text-[#ff4d57] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex h-12 items-center rounded-full bg-[#E50914] px-6 text-sm font-black text-white shadow-lg shadow-[#E50914]/30 transition hover:scale-[1.03] hover:bg-[#ff1f2d] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Join Now
                </Link>
              </>
            )}

            <button
              type="button"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-[#211a1b]/80 px-4 text-sm font-bold text-white backdrop-blur-md transition hover:border-[#E50914]/60 hover:bg-[#E50914]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
              aria-label="Language"
            >
              EN
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile expanding search bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="overflow-hidden px-4 pb-4 lg:hidden"
            >
              <SearchAutocomplete
                size="sm"
                autoFocus
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                onSelect={handleSuggestionSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop second row */}
        <div className="hidden border-t border-white/10 py-4 lg:flex lg:items-center lg:justify-between">
          <nav className="no-scrollbar flex items-center gap-2 overflow-x-auto" aria-label="Public navigation">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink key={link.name} to={link.path} end={link.end} className={({ isActive }) => cn(baseNavClass, isActive ? navActiveClass : navIdleClass)}>
                  {({ isActive }) => (
                    <>
                      <Icon className={navIconClass(isActive)} />
                      {link.name}
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Movies dropdown */}
            <div className="relative inline-flex shrink-0">
              <div
                className={cn(
                  'group inline-flex items-center rounded-full transition',
                  isMoviesActive ? navActiveClass : moviesDropdownOpen ? 'bg-[#211a1b]/80' : navIdleClass,
                )}
              >
                <NavLink
                  to="/movies"
                  className="flex items-center gap-2 py-2 pl-4 pr-1 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
                >
                  <Clapperboard className={navIconClass(isMoviesActive)} />
                  Movies
                </NavLink>
                <button
                  type="button"
                  onClick={() => setMoviesDropdownOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={moviesDropdownOpen}
                  aria-label="Toggle movies menu"
                  className="flex h-8 w-7 items-center justify-center rounded-full text-slate-300 transition hover:text-white focus:outline-none"
                >
                  <ChevronDown className={cn('h-4 w-4 transition', moviesDropdownOpen && 'rotate-180')} />
                </button>
              </div>

              <AnimatePresence>
                {moviesDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMoviesDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute left-0 top-full z-50 mt-2 w-72 origin-top-left rounded-2xl border border-white/10 bg-[#120d0e] p-2 text-white shadow-2xl shadow-black/50"
                    >
                      {MOVIE_MENU_ITEMS.map((item) => {
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => {
                              navigate(item.path);
                              closeMenus();
                            }}
                            className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/10"
                          >
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#E50914]" />
                            <span>
                              <span className="block text-sm font-bold text-white">{item.name}</span>
                              <span className="block text-[11px] text-slate-400">{item.description}</span>
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Cinema selector */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setCinemaDropdownOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={cinemaDropdownOpen}
              className="inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
            >
              <MapPin className="h-4 w-4 shrink-0 text-[#E50914]" />
              <span className="max-w-[180px] truncate">{selectedCinema?.name ?? 'All Cinemas'}</span>
              <ChevronDown className={cn('h-4 w-4 shrink-0 transition', cinemaDropdownOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {cinemaDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCinemaDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    role="listbox"
                    className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-2xl border border-white/10 bg-[#120d0e] p-2 text-white shadow-2xl shadow-black/50"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedLocationId === null}
                      onClick={() => {
                        selectLocation(null);
                        setCinemaDropdownOpen(false);
                      }}
                      className={cn(dropdownItemClass, 'justify-between')}
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#E50914]" />
                        All Cinemas
                      </span>
                      {selectedLocationId === null && <Check className="h-4 w-4 text-[#E50914]" />}
                    </button>

                    {locations.map((cinema) => {
                      const isSelected = cinema.id === selectedLocationId;

                      return (
                        <button
                          key={cinema.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            selectLocation(cinema.id);
                            setCinemaDropdownOpen(false);
                          }}
                          className={cn(dropdownItemClass, 'justify-between')}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-bold text-white">{cinema.name}</span>
                            <span className="block truncate text-[10px] text-slate-400">
                              {cinema.city}, {cinema.address}
                            </span>
                          </span>
                          {isSelected && <Check className="h-4 w-4 shrink-0 text-[#E50914]" />}
                        </button>
                      );
                    })}

                    {locations.length === 0 && !locationsLoading && (
                      <p className="px-3 py-2 text-xs text-slate-400">No cinemas available.</p>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-white/10 bg-[#0b0809] px-4 pb-4 lg:hidden"
          >
            {/* Cinema selector */}
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Cinema</p>
              <div className="grid gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    selectLocation(null);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-[#E50914]" />
                  <span className="flex-1 truncate">All Cinemas</span>
                  {selectedLocationId === null && <Check className="h-4 w-4 shrink-0 text-[#E50914]" />}
                </button>

                {locations.map((cinema) => {
                  const isSelected = cinema.id === selectedLocationId;

                  return (
                    <button
                      key={cinema.id}
                      type="button"
                      onClick={() => {
                        selectLocation(cinema.id);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-[#E50914]" />
                      <span className="flex-1 truncate">{cinema.name}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-[#E50914]" />}
                    </button>
                  );
                })}

                {locations.length === 0 && !locationsLoading && (
                  <p className="px-3 py-1 text-xs text-slate-400">No cinemas available.</p>
                )}
              </div>
            </div>

            {/* Nav links */}
            <nav className="mt-4 grid gap-2" aria-label="Mobile public navigation">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;

                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    end={link.end}
                    onClick={closeMenus}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition',
                        isActive ? 'bg-[#E50914]/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={cn('h-4 w-4', isActive ? 'text-[#E50914]' : 'text-slate-400')} />
                        {link.name}
                      </>
                    )}
                  </NavLink>
                );
              })}

              {/* Movies accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileMoviesOpen((open) => !open)}
                  aria-expanded={mobileMoviesOpen}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    <Clapperboard className="h-4 w-4 text-slate-400" />
                    Movies
                  </span>
                  <ChevronDown className={cn('h-4 w-4 transition', mobileMoviesOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {mobileMoviesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="ml-6 mt-1 grid gap-1 border-l border-white/10 pl-3">
                        {MOVIE_MENU_ITEMS.map((item) => {
                          const Icon = item.icon;

                          return (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => {
                                navigate(item.path);
                                closeMenus();
                              }}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                            >
                              <Icon className="h-4 w-4 text-[#E50914]" />
                              {item.name}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* My Tickets */}
            <div className="mt-2 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  handleTicketClick();
                  closeMenus();
                }}
                className="flex items-center gap-3 rounded-xl border border-white/15 px-3 py-3 text-left text-sm font-bold text-white transition hover:bg-white/10"
              >
                <Ticket className="h-4 w-4 text-[#E50914]" />
                My Tickets
              </button>
            </div>

            {/* Account options */}
            <div className="mt-4 border-t border-white/10 pt-4">
              {canViewAdminPanel && (
                <Link
                  to="/admin/dashboard"
                  onClick={closeMenus}
                  className="flex items-center gap-3 rounded-xl bg-[#E50914]/15 px-3 py-3 text-sm font-black text-[#ff4d57]"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}

              {isAuthenticated && user ? (
                <div className="grid gap-2">
                  <div className="flex items-center gap-3 rounded-xl bg-[#211a1b]/80 px-3 py-2.5">
                    <img
                      src={user.avatar || DEFAULT_AVATAR}
                      alt={user.username}
                      className="h-8 w-8 rounded-full border border-[#E50914] object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white">{user.username}</p>
                      <p className="truncate text-[10px] text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/settings"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <Settings className="h-4 w-4 text-[#E50914]" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenus();
                      useAuthStore.getState().logout();
                    }}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-rose-300 transition hover:bg-rose-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="rounded-xl border border-white/15 px-3 py-3 text-center text-sm font-bold text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenus}
                    className="rounded-xl bg-[#E50914] px-3 py-3 text-center text-sm font-black text-white"
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </div>

            {/* Language */}
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <span className="text-sm font-bold text-slate-300">Language</span>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#211a1b]/80 px-4 py-2 text-sm font-bold text-white"
              >
                EN
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
