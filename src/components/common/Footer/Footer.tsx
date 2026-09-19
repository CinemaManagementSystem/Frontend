import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCinemaStore } from '@/store/cinemaStore';
import {
  Film,
  MapPin,
  Heart,
  Send,
  ArrowRight,
  Globe,
  Camera,
  AtSign,
  Play,
} from 'lucide-react';

const SOCIAL_LINKS = [
  { name: 'Facebook', icon: Globe, href: '#' },
  { name: 'Instagram', icon: Camera, href: '#' },
  { name: 'Twitter', icon: AtSign, href: '#' },
  { name: 'YouTube', icon: Play, href: '#' },
];

const SECONDARY_LINKS = [
  { name: 'About', to: '/' },
  { name: 'Terms', to: '/' },
  { name: 'Privacy', to: '/' },
  { name: 'Cinema Locations', to: '/cinemas' },
];

const MOVIE_LINKS = [
  { name: 'Now Showing', to: '/movies' },
  { name: 'Coming Soon', to: '/coming-soon' },
  { name: 'IMAX Experiences', to: '/movies' },
  { name: 'Exclusive Premieres', to: '/premiere' },
];

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const cinemas = useCinemaStore((state) => state.cinemas);

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmail('');
  };

  return (
    <footer className="border-t border-border bg-background text-sm text-muted-foreground">
      {/* Stay Connected newsletter block */}
      <section className="border-b border-border bg-card/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:py-16">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
              <Send className="h-3.5 w-3.5" />
              Newsletter
            </span>
            <h3 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Stay Connected
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Subscribe for early movie access, premiere invites, and exclusive discounts.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:max-w-md lg:justify-self-end">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                aria-label="Email address"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-red-500 focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Join
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">No spam. Unsubscribe at any time.</p>
          </form>
        </div>
      </section>

      {/* Footer base */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E50914] shadow-lg shadow-[#E50914]/30">
                <Film className="h-5 w-5 text-white" />
              </span>
              <span className="text-xl font-black uppercase tracking-wider text-foreground">
                CINEMA<span className="text-[#E50914]">TIQUE</span>
              </span>
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              Experience the pinnacle of cinema. IMAX, 3D Laser, and Dolby Atmos audio with premium
              VIP reclining suites.
            </p>
            <Link to="/cinemas?cinema=ALL" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <MapPin className="h-3.5 w-3.5 text-[#E50914]" /> Find your cinema
            </Link>
          </div>

          {/* Movies */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">
              Movies
            </h4>
            <ul className="space-y-2.5 text-xs">
              {MOVIE_LINKS.map((link) => (
                <li key={link.name}>
                  <Link to={link.to} className="transition-colors hover:text-foreground">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cinemas */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">
              Cinemas
            </h4>
            <ul className="space-y-2.5 text-xs">
              {cinemas.map((cinema) => (
                <li key={cinema.id}>
                  <Link to={`/cinemas?cinema=${cinema.id}`} className="transition-colors hover:text-foreground">
                    {cinema.name}
                  </Link>
                </li>
              ))}
              <li><Link to="/cinemas?cinema=ALL" className="transition-colors hover:text-foreground">All cinema locations</Link></li>
              <li><Link to="/history" className="transition-colors hover:text-foreground">Ticket booking history</Link></li>
            </ul>
          </div>
        </div>

        {/* Secondary links + social icons */}
        <div className="mt-10 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <nav
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"
            aria-label="Footer navigation"
          >
            {SECONDARY_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className="font-medium transition-colors hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map(({ name, icon: Icon, href }) => (
              <a
                key={name}
                href={href}
                aria-label={name}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-card text-muted-foreground transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:text-red-400"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Cinematique Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="h-3.5 w-3.5 fill-[#E50914] text-[#E50914]" />
            <span>for movie lovers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
