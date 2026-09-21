import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Navbar } from '@/components/common/Navbar/Navbar';
import { Footer } from '@/components/common/Footer/Footer';
import { NavLink } from 'react-router-dom';
import { Clapperboard, Home, Ticket, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeroBackdropProvider } from '@/context/HeroBackdropContext';
import { PageBackdrop } from '@/components/common/PageBackdrop/PageBackdrop';

export const MainLayout: React.FC = () => {
  const { pathname } = useLocation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const pageVariants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 8,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -8,
    },
  };

  return (
    <HeroBackdropProvider>
      <div className="relative isolate flex min-h-screen flex-col bg-transparent text-foreground selection:bg-[#E50914] selection:text-white">
        <PageBackdrop />
        <Navbar />
        <main className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        </main>
        <Footer />
        <nav
        className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-white/10 bg-black/90 px-3 pt-2 backdrop-blur-xl lg:hidden"
        aria-label="Mobile quick navigation"
      >
        {[
          { to: '/', label: 'Home', icon: Home, end: true },
          { to: '/movies', label: 'Movies', icon: Clapperboard },
          { to: '/history', label: 'Tickets', icon: Ticket },
          { to: '/settings', label: 'Profile', icon: UserRound },
        ].map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(
              'flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-colors',
              isActive ? 'text-white' : 'text-white/45',
            )}
          >
            {({ isActive }) => <><Icon className={cn('h-4 w-4', isActive && 'text-[var(--primary)]')} /><span>{label}</span></>}
          </NavLink>
        ))}
        </nav>
      </div>
    </HeroBackdropProvider>
  );
};
