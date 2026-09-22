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
  { name: 'Privacy & Policy', to: '/' },
];

const SOCIAL_LINKS = [
  { name: 'Facebook', icon: Globe },
  { name: 'Instagram', icon: Camera },
  { name: 'YouTube', icon: Play },
  { name: 'TikTok', icon: Music2 },
  { name: 'Telegram', icon: Send },
];

const circleButton = 'inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition hover:border-[var(--primary)] hover:bg-[var(--primary)]/15 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export const Footer: React.FC = () => (
  <footer className="border-t border-border bg-card text-card-foreground">
    <div className="container-main pb-8 pt-12 sm:pt-16">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.2fr] lg:gap-12">
        <FooterColumn title="Company" links={COMPANY_LINKS} />
        <FooterColumn title="Cinemas" links={[{ name: 'Find a cinema', to: '/cinemas' }, { name: 'Now showing', to: '/movies' }, { name: 'Coming soon', to: '/coming-soon' }]} />
        <FooterColumn title="More" links={MORE_LINKS} />
        <div className="space-y-7">
          <div>
            <h2 className="text-sm font-bold text-foreground">Download Our App</h2>
            <div className="mt-4 flex items-center gap-3">
              <a href="#download" aria-label="Download on Google Play" className={circleButton}><Play className="h-4 w-4 fill-current" /></a>
              <a href="#download" aria-label="Download on the App Store" className={circleButton}><Apple className="h-4 w-4 fill-current" /></a>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Follow Our Social Media</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {SOCIAL_LINKS.map(({ name, icon: Icon }) => <a key={name} href="#social" aria-label={name} className={circleButton}><Icon className="h-4 w-4" /></a>)}
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="payment-title" className="mt-11 sm:mt-12">
        <h2 id="payment-title" className="text-sm font-bold text-foreground">Payment</h2>
        <div className="mt-4 flex items-center gap-8 text-xl font-black tracking-tight">
          <span className="text-[#0083a9]">ABA'<i className="font-black text-[#18a9d1]">PAYWAY</i></span>
          <span className="font-black italic text-[#1e72b8]">VISA</span>
          <span className="relative flex h-5 w-8 items-center"><span className="absolute left-0 h-5 w-5 rounded-full bg-[#ef1b2d]" /><span className="absolute left-3 h-5 w-5 rounded-full bg-[#f79e1b] opacity-95" /></span>
        </div>
      </section>

      <div className="mt-9 border-t border-border pt-5 text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} Legend Cinemas. All rights reserved.
      </div>
    </div>
  </footer>
);

function FooterColumn({ title, links }: { title: string; links: Array<{ name: string; to: string }> }) {
  return <nav aria-label={`${title} footer links`}><h2 className="text-sm font-bold text-foreground">{title}</h2><ul className="mt-4 space-y-2.5">{links.map((link) => <li key={link.name}><Link to={link.to} className="text-xs text-muted-foreground transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]">{link.name}</Link></li>)}</ul></nav>;
}
