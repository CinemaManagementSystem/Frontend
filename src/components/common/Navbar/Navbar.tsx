import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Clapperboard,
  Crown,
  Gift,
  Home,
  LogOut,
  MapPin,
  Moon,
  Play,
  Search,
  Shield,
  ShoppingBag,
  Sparkles,
  Sun,
  Ticket,
  User as UserIcon,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AnimatePresence, motion } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { useCinemaStore } from '@/store/cinemaStore';
import { canAccessAdmin } from '@/lib/authRole';
import { cn } from '@/lib/utils';
import { SearchAutocomplete } from './SearchAutocomplete';
import { LogoutModal } from '@/components/common/LogoutModal/LogoutModal';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { CinematiqueLogo } from '@/components/common/CinematiqueLogo';
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
  { name: 'View All Movies', path: '/movies', icon: Clapperboard, description: 'Browse full catalog' },
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
          <Avatar src={user.avatar} alt={user.username} className="h-7 w-7 border border-[var(--primary)]" />
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
  const navigate = useNavigate();
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
    navigate(`/cinemas?cinema=${encodeURIComponent(cinemaId)}`);
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
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [moviesDropdownOpen, setMoviesDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isMoviesActive =
    location.pathname.startsWith('/movies') ||
    location.pathname === '/coming-soon' ||
    location.pathname === '/premiere';

  useEffect(() => {
    setMoviesDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenus = () => {
    setMoviesDropdownOpen(false);
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
    <header className={cn('sticky top-0 z-20 w-full border-b border-white/10 text-white transition-all', isScrolled ? 'bg-black/60 backdrop-blur-md' : 'bg-transparent')}>
      {/* Row 1: Search | Logo | Actions */}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Search Bar */}
        <div className="flex items-center gap-3">
          <div className="hidden w-52 lg:block xl:w-64">
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
          <CinematiqueLogo />
        </Link>

        {/* Right: Actions (Ticket, User/Join, Bell, Language, Theme) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Ticket Button */}
          <button
            type="button"
            onClick={handleTicketClick}
            className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:border-[var(--primary)]/60 hover:bg-white/[0.06] sm:flex"
          >
            <Ticket className="h-3.5 w-3.5 text-[var(--primary)]" />
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

          {/* Language Selector */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:border-[var(--primary)]/60 hover:bg-white/[0.06]"
              aria-label="Select language"
            >
              <span className="text-[10px] font-black uppercase">KH</span>
              <ChevronDown className="h-3 w-3 text-white/50" />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="icon-btn-circle"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Row 2: Nav Links | Cinema Selector */}
      <div className="hidden border-t border-white/10 bg-transparent py-2 backdrop-blur-md lg:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Nav Links */}
          <nav className="flex items-center gap-1" aria-label="Public sub navigation">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition-all',
                      isActive
                        ? 'text-white'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-[var(--primary)]' : '')} />
                      {link.name}
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Movies Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoviesDropdownOpen((open) => !open)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition-all cursor-pointer',
                  isMoviesActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                <Clapperboard className={cn('h-3.5 w-3.5', isMoviesActive ? 'text-[var(--primary)]' : '')} />
                Movies
                <ChevronDown className={cn('h-3 w-3 transition-transform', moviesDropdownOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {moviesDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMoviesDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 z-50 w-64 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl p-2 text-white shadow-2xl"
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
                            className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition hover:bg-white/5"
                          >
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                            <div>
                              <span className="block text-xs font-bold text-white">{item.name}</span>
                              <span className="block text-[10px] text-white/50">{item.description}</span>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <CinemaSelector onSelect={closeMenus} />
        </div>
      </div>

    </header>
  );
};
