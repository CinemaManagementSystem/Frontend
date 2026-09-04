import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Film, Home, ArrowLeft, Film as MovieIcon, Search } from 'lucide-react';
import { useLanguage } from '@/i18n';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-[80vh] bg-[#0f0f10] text-white flex items-center justify-center px-4 py-16 selection:bg-[#E50914]">
      <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
        
        {/* Animated 404 Hero Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative inline-block"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-[#E50914]/20 blur-3xl rounded-full transform -translate-y-4 scale-125" />
          
          <div className="relative flex items-center justify-center gap-2 sm:gap-4 select-none">
            <span className="text-8xl sm:text-9xl font-black tracking-tighter bg-gradient-to-b from-white via-gray-200 to-gray-600 bg-clip-text text-transparent">
              4
            </span>
            
            {/* Animated Film Reel for the '0' */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#E50914] to-red-950 p-1 border-4 border-border shadow-2xl flex items-center justify-center shrink-0"
            >
              <div className="w-full h-full rounded-full border-4 border-dashed border-border flex items-center justify-center">
                <Film className="w-8 h-8 sm:w-12 sm:h-12 text-white/90" />
              </div>
            </motion.div>
            
            <span className="text-8xl sm:text-9xl font-black tracking-tighter bg-gradient-to-b from-white via-gray-200 to-gray-600 bg-clip-text text-transparent">
              4
            </span>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] text-[11px] font-black uppercase tracking-widest">
            <Search className="w-3.5 h-3.5" />
            <span>{t('notFound.title')}</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            Lost in the <span className="bg-gradient-to-r from-[#E50914] via-rose-500 to-amber-500 bg-clip-text text-transparent">Cutting Room</span> Floor?
          </h1>
          
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            The page or screening link you are looking for has been moved, deleted, or doesn't exist in our box office database.
          </p>
        </motion.div>

        {/* Quick Action Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <button
            onClick={() => navigate(-1)}
            className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-border text-muted-foreground hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>

          <Link
            to="/"
            className="py-3 px-6 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#E50914]/30 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            {t('notFound.backHome')}
          </Link>

          <Link
            to="/movies"
            className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-border text-muted-foreground hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          >
            <MovieIcon className="w-4 h-4 text-[#E50914]" />
            Browse Movies
          </Link>
        </motion.div>

      </div>
    </div>
  );
};
