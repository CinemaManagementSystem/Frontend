import React from 'react';
import { Link } from 'react-router-dom';
import { Apple, Camera, Globe, Music2, Play, Send } from 'lucide-react';

const COMPANY_LINKS = [
  { name: 'About Us', to: '/' },
  { name: 'Contact Us', to: '/settings' },
  { name: 'Cinemas', to: '/cinemas' },
];

const MORE_LINKS = [
  { name: 'Promotions', to: '/promotion' },
  { name: 'News & Activity', to: '/coming-soon' },
  { name: 'My Ticket', to: '/history' },
  { name: 'Terms & Conditions', to: '/' },
  { name: 'Privacy Policy', to: '/' },
];

const SOCIAL_LINKS = [
  { name: 'Facebook', icon: Globe, href: 'https://facebook.com' },
  { name: 'Instagram', icon: Camera, href: 'https://instagram.com' },
  { name: 'YouTube', icon: Play, href: 'https://youtube.com' },
  { name: 'TikTok', icon: Music2, href: 'https://tiktok.com' },
  { name: 'Telegram', icon: Send, href: 'https://telegram.org' },
];

export const Footer: React.FC = () => (
  <footer className="border-t border-border bg-card text-card-foreground">
    <div className="container-main pb-8 pt-12 sm:pt-16">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.3fr] lg:gap-12">
        <FooterColumn title="Company" links={COMPANY_LINKS} />
        <FooterColumn
          title="Cinemas"
          links={[
            { name: 'Find a cinema', to: '/cinemas' },
            { name: 'Now showing', to: '/movies' },
            { name: 'Coming soon', to: '/coming-soon' },
          ]}
        />
        <FooterColumn title="More" links={MORE_LINKS} />

        {/* Apps & Socials */}
        <div className="space-y-7">
          {/* Download Our App with Official Store Badges */}
          <div>
            <h2 className="text-sm font-bold text-foreground">Download Our App</h2>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              Fast ticketing, mobile food ordering &amp; seat selection.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* App Store Badge */}
              <a
                href="#download"
                aria-label="Download on the App Store"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/20 bg-black/80 hover:border-white/50 hover:bg-white/10 transition-all text-white shadow-sm"
              >
                <Apple className="h-5 w-5 fill-current shrink-0" />
                <div className="text-left">
                  <span className="block text-[8px] uppercase tracking-wider text-white/60 leading-none">
                    Download on the
                  </span>
                  <span className="block text-xs font-bold leading-tight">App Store</span>
                </div>
              </a>

              {/* Google Play Badge */}
              <a
                href="#download"
                aria-label="Get it on Google Play"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/20 bg-black/80 hover:border-white/50 hover:bg-white/10 transition-all text-white shadow-sm"
              >
                <Play className="h-4 w-4 fill-current text-emerald-400 shrink-0" />
                <div className="text-left">
                  <span className="block text-[8px] uppercase tracking-wider text-white/60 leading-none">
                    GET IT ON
                  </span>
                  <span className="block text-xs font-bold leading-tight">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Social Media Links with High Contrast & Minimal Aesthetic */}
          <div>
            <h2 className="text-sm font-bold text-foreground">Follow Our Social Media</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              {SOCIAL_LINKS.map(({ name, icon: Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white hover:border-[#E50914] hover:bg-[#E50914] hover:text-white transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Partners */}
      <section aria-labelledby="payment-title" className="mt-11 sm:mt-12 pt-8 border-t border-border/60">
        <h2 id="payment-title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Accepted Payment Methods
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-6 text-xl font-black tracking-tight">
          <span className="text-[#0083a9] text-base font-bold">
            ABA&apos;<i className="font-black text-[#18a9d1]">PAYWAY</i>
          </span>
          <span className="font-black italic text-[#1e72b8] text-base">VISA</span>
          <span className="relative flex h-5 w-8 items-center">
            <span className="absolute left-0 h-5 w-5 rounded-full bg-[#ef1b2d]" />
            <span className="absolute left-3 h-5 w-5 rounded-full bg-[#f79e1b] opacity-95" />
          </span>
          <span className="text-xs font-bold text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded bg-rose-500/10">
            KHQR
          </span>
        </div>
      </section>

      {/* Copyright */}
      <div className="mt-8 border-t border-border pt-5 text-center text-[11px] text-muted-foreground">
        &copy; {new Date().getFullYear()} Cinematique &amp; Legend Cinemas. All rights reserved.
      </div>
    </div>
  </footer>
);

function FooterColumn({ title, links }: { title: string; links: Array<{ name: string; to: string }> }) {
  return (
    <nav aria-label={`${title} footer links`}>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              to={link.to}
              className="text-xs text-muted-foreground transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
