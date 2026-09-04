import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Film, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/i18n';

export const AuthLayout: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen relative flex flex-col justify-between bg-background text-foreground selection:bg-[#E50914] selection:text-white overflow-hidden">
      {/* Background Graphic Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-[#E50914]/20 via-transparent to-transparent opacity-60 pointer-events-none" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80')`,
        }}
      />

      {/* Top Header */}
      <header className="relative z-10 px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#E50914] flex items-center justify-center shadow-lg shadow-[#E50914]/30 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-wider text-white uppercase">
            CINEMA<span className="text-[#E50914]">TIQUE</span>
          </span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('auth.backToHome')}</span>
        </Link>
      </header>

      {/* Main Form Center Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card/90 border border-border rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} {t('auth.copyright')}.
      </footer>
    </div>
  );
};
