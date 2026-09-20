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

const circleButton = 'inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/75 text-white transition hover:border-red-500 hover:bg-red-500/15 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

export const Footer: React.FC = () => (
  <footer className="border-t border-white/10 bg-black text-white">
    <div className="mx-auto max-w-3xl px-6 pb-6 pt-10 sm:px-8 sm:pt-12">
      <div className="grid gap-10 sm:grid-cols-[1fr_1fr_1.2fr] sm:gap-12">
        <FooterColumn title="Company" links={COMPANY_LINKS} />
        <FooterColumn title="More" links={MORE_LINKS} />
        <div className="space-y-7">
          <div>
            <h2 className="text-sm font-bold text-white">Download Our App</h2>
            <div className="mt-4 flex items-center gap-3">
              <a href="#download" aria-label="Download on Google Play" className={circleButton}><Play className="h-4 w-4 fill-current" /></a>
              <a href="#download" aria-label="Download on the App Store" className={circleButton}><Apple className="h-4 w-4 fill-current" /></a>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Follow Our Social Media</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {SOCIAL_LINKS.map(({ name, icon: Icon }) => <a key={name} href="#social" aria-label={name} className={circleButton}><Icon className="h-4 w-4" /></a>)}
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="payment-title" className="mt-11 sm:mt-12">
        <h2 id="payment-title" className="text-sm font-bold text-white">Payment</h2>
        <div className="mt-4 flex items-center gap-8 text-xl font-black tracking-tight">
          <span className="text-[#0083a9]">ABA'<i className="font-black text-[#18a9d1]">PAYWAY</i></span>
          <span className="font-black italic text-[#1e72b8]">VISA</span>
          <span className="relative flex h-5 w-8 items-center"><span className="absolute left-0 h-5 w-5 rounded-full bg-[#ef1b2d]" /><span className="absolute left-3 h-5 w-5 rounded-full bg-[#f79e1b] opacity-95" /></span>
        </div>
      </section>

      <div className="mt-9 border-t border-white/15 pt-5 text-center text-[11px] text-white/80">
        © {new Date().getFullYear()} Legend Cinemas. All rights reserved.
      </div>
    </div>
  </footer>
);

function FooterColumn({ title, links }: { title: string; links: Array<{ name: string; to: string }> }) {
  return <nav aria-label={`${title} footer links`}><h2 className="text-sm font-bold text-white">{title}</h2><ul className="mt-4 space-y-2.5">{links.map((link) => <li key={link.name}><Link to={link.to} className="text-xs text-white/80 transition hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">{link.name}</Link></li>)}</ul></nav>;
}
