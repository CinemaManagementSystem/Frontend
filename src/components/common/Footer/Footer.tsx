import React from 'react';
import { Link } from 'react-router-dom';
import { Film, MapPin, Heart } from 'lucide-react';
import { useLanguage } from '@/i18n';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0b0b0d] border-t border-border text-muted-foreground text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E50914] flex items-center justify-center shadow-lg shadow-[#E50914]/30">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-wider text-foreground uppercase">
                CINEMA<span className="text-[#E50914]">TIQUE</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E50914]" /> {t('footer.location')}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              {t('footer.movies')}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/movies" className="hover:text-foreground transition-colors">
                  {t('footer.nowShowing')}
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-foreground transition-colors">
                  {t('footer.comingSoon')}
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-foreground transition-colors">
                  {t('footer.imaxExperiences')}
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-foreground transition-colors">
                  {t('footer.exclusivePremieres')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Experience */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              {t('footer.cinemas')}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  {t('footer.grandHall')}
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  {t('footer.dolbyScreen')}
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  {t('footer.vipLounge')}
                </span>
              </li>
              <li>
                <Link to="/history" className="hover:text-foreground transition-colors">
                  {t('footer.ticketHistory')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              {t('footer.stayConnected')}
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              {t('footer.subscribeText')}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder={t('footer.enterEmail')}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#E50914]"
              />
              <button className="px-3 py-2 bg-[#E50914] text-white text-xs font-bold rounded-lg hover:bg-[#ff1f2d] transition-colors">
                {t('footer.join')}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
          <div className="flex items-center gap-1">
            <span>{t('footer.builtWith')}</span>
            <Heart className="w-3.5 h-3.5 text-[#E50914] fill-[#E50914]" />
            <span>{t('footer.forMovieLovers')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
