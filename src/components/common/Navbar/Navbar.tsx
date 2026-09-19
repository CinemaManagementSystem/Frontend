import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clapperboard,
  Crown,
  Gift,
  Home,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Play,
  Shield,
  ShoppingBag,
  Sparkles,
  Sun,
  Ticket,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AnimatePresence, motion } from 'motion/react';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
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
  'absolute z-50 mt-2 origin-top rounded-2xl border border-border bg-card p-2 text-foreground shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950 dark:text-white';

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
          className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-xs font-bold text-foreground transition hover:border-[#E50914]/60 hover:bg-muted dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:text-white dark:hover:bg-zinc-800"
        >
          <Avatar src={user.avatar} alt={user.username} className="h-7 w-7 border border-[#E50914]" />
          <span className="max-w-[90px] truncate">{user.username}</span>
          <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
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
                <div className="mb-1 flex items-center gap-2.5 border-b border-border px-3 py-2.5 dark:border-zinc-800">
                  <Avatar src={user.avatar} alt={user.username} className="h-9 w-9 border border-[#E50914]" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-foreground dark:text-white">{user.username}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
                    <span className="mt-0.5 inline-block rounded bg-[#E50914]/20 px-2 py-0.5 text-[9px] font-black uppercase text-[#E50914]">
                      {user.role}
                    </span>
                  </div>
                </div>

                {canViewAdminPanel && (
                  <button
                    type="button"
                    onClick={() => go('/admin/dashboard')}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-foreground hover:bg-muted dark:text-white dark:hover:bg-zinc-800"
                  >
                    <Shield className="h-4 w-4 text-[#E50914]" />
                    Admin Dashboard
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => go('/settings')}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-muted dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  Profile & Settings
                </button>
                <button
                  type="button"
                  onClick={() => go('/history')}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-foreground hover:bg-muted dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Ticket className="h-4 w-4 text-amber-400" />
                  My Tickets
                </button>

                <div className="my-1 border-t border-border pt-1 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setLogoutOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-500 transition hover:bg-rose-500/10 dark:text-rose-400"
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

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { locations, selectedLocationId, selectLocation, loading: locationsLoading } = useLocationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moviesDropdownOpen, setMoviesDropdownOpen] = useState(false);
  const [cinemaDropdownOpen, setCinemaDropdownOpen] = useState(false);

  const selectedCinema = locations.find((item) => item.id === selectedLocationId);
  const isMoviesActive =
    location.pathname.startsWith('/movies') ||
    location.pathname === '/coming-soon' ||
    location.pathname === '/premiere';

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoviesDropdownOpen(false);
    setCinemaDropdownOpen(false);
  }, [location.pathname]);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setMoviesDropdownOpen(false);
    setCinemaDropdownOpen(false);
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 text-foreground backdrop-blur-xl shadow-md transition-all dark:border-zinc-800/80 dark:bg-zinc-950/95 dark:text-white">
      {/* Top Header Row (Search | Brand Logo | Actions) */}
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Search Bar (Desktop) & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted lg:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

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
          className="flex items-center rounded-full focus:outline-none"
          aria-label="CINEMATIQUE Home"
        >
          <CinematiqueLogo />
        </Link>

        {/* Right: Actions (Ticket, User/Join, Bell, Theme) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Ticket Button */}
          <button
            type="button"
            onClick={handleTicketClick}
            className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-foreground transition hover:border-[#E50914]/60 hover:bg-muted dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:text-white dark:hover:bg-zinc-800 sm:flex"
          >
            <Ticket className="h-3.5 w-3.5 text-[#E50914]" />
            Ticket
          </button>

          {/* Account / Join Now */}
          {isAuthenticated && user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              to="/login"
              className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-bold text-foreground transition hover:border-[#E50914]/60 hover:bg-muted dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:text-white dark:hover:bg-zinc-800"
            >
              <UserIcon className="h-3.5 w-3.5 text-[#E50914]" />
              Join Now
            </Link>
          )}

          {/* Notifications Bell */}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#E50914]" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted dark:border-zinc-700/80 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:text-white"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Bar (Nav links on Left | Cinema Selector on Right) */}
      <div className="hidden border-t border-border bg-muted/60 py-1.5 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90 lg:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
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
                        ? 'bg-[#E50914] text-white shadow-md shadow-[#E50914]/30'
                        : 'text-foreground/80 hover:bg-muted hover:text-foreground dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:hover:text-white',
                    )
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.name}
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
                    ? 'bg-[#E50914] text-white shadow-md shadow-[#E50914]/30'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:hover:text-white',
                )}
              >
                <Clapperboard className="h-3.5 w-3.5" />
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
                      className="absolute left-0 top-full mt-2 z-50 w-64 rounded-2xl border border-border bg-card p-2 text-foreground shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
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
                            className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition hover:bg-muted dark:hover:bg-zinc-800"
                          >
                            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#E50914]" />
                            <div>
                              <span className="block text-xs font-bold text-foreground dark:text-white">{item.name}</span>
                              <span className="block text-[10px] text-muted-foreground">{item.description}</span>
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

          {/* Cinema Location Selector (Far Right) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCinemaDropdownOpen((open) => !open)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-bold text-foreground transition hover:border-[#E50914]/50 hover:bg-muted dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#E50914]" />
              <span className="max-w-[150px] truncate">{selectedCinema?.name ?? 'All Cinemas'}</span>
              <ChevronDown className={cn('h-3 w-3 shrink-0 text-muted-foreground transition-transform', cinemaDropdownOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {cinemaDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCinemaDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-border bg-card p-2 text-foreground shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        selectLocation(null);
                        setCinemaDropdownOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-foreground hover:bg-muted dark:text-white dark:hover:bg-zinc-800"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#E50914]" />
                        All Cinemas
                      </span>
                      {selectedLocationId === null && <Check className="h-3.5 w-3.5 text-[#E50914]" />}
                    </button>

                    {locations.map((cinema) => {
                      const isSelected = cinema.id === selectedLocationId;

                      return (
                        <button
                          key={cinema.id}
                          type="button"
                          onClick={() => {
                            selectLocation(cinema.id);
                            setCinemaDropdownOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-foreground hover:bg-muted dark:text-white dark:hover:bg-zinc-800"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-bold">{cinema.name}</span>
                            <span className="block truncate text-[10px] text-muted-foreground">{cinema.city}</span>
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#E50914]" />}
                        </button>
                      );
                    })}

                    {locations.length === 0 && !locationsLoading && (
                      <p className="px-3 py-1.5 text-xs text-muted-foreground">No cinemas available.</p>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-card px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden"
          >
            {/* Search */}
            <div className="mb-3">
              <SearchAutocomplete
                size="sm"
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                onSelect={handleSuggestionSelect}
              />
            </div>

            {/* Cinema Location */}
            <div className="mb-3">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cinema</p>
              <div className="grid gap-1">
                <button
                  type="button"
                  onClick={() => {
                    selectLocation(null);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-foreground hover:bg-muted dark:text-white dark:hover:bg-zinc-800"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#E50914]" />
                  <span className="flex-1 truncate">All Cinemas</span>
                  {selectedLocationId === null && <Check className="h-3.5 w-3.5 text-[#E50914]" />}
                </button>
                {locations.map((cinema) => (
                  <button
                    key={cinema.id}
                    type="button"
                    onClick={() => {
                      selectLocation(cinema.id);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-muted dark:text-white dark:hover:bg-zinc-800"
                  >
                    <MapPin className="h-3.5 w-3.5 text-[#E50914]" />
                    <span className="flex-1 truncate">{cinema.name}</span>
                    {cinema.id === selectedLocationId && <Check className="h-3.5 w-3.5 text-[#E50914]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            <nav className="grid gap-1 border-t border-border pt-3 dark:border-zinc-800" aria-label="Mobile navigation">
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
                        'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition',
                        isActive
                          ? 'bg-[#E50914] text-white'
                          : 'text-foreground/80 hover:bg-muted hover:text-foreground dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white',
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </NavLink>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
