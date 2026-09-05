import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Film,
  LayoutDashboard,
  Clapperboard,
  Ticket,
  Users,
  Tags,
  MapPin,
  Building2,
  MonitorPlay,
  Armchair,
  CalendarClock,
  Package,
  Popcorn,
  ShoppingCart,
  UtensilsCrossed,
  CreditCard,
  Airplay,
  ReceiptText,
  ArrowLeft,
  LogOut,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLanguage } from '@/i18n';

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { t } = useLanguage();

  const sections: MenuSection[] = [
    {
      label: t('sidebar.mainMenu'),
      items: [{ name: t('sidebar.dashboard'), path: '/admin/dashboard', icon: LayoutDashboard }],
    },
    {
      label: t('sidebar.catalog'),
      items: [
        { name: t('sidebar.categories'), path: '/admin/movie-categories', icon: Tags },
        { name: t('sidebar.movies'), path: '/admin/movies', icon: Clapperboard },
      ],
    },
    {
      label: t('sidebar.screening'),
      items: [
        { name: t('sidebar.locations'), path: '/admin/locations', icon: MapPin },
        { name: t('sidebar.theaters'), path: '/admin/theaters', icon: Building2 },
        { name: t('sidebar.screens'), path: '/admin/screens', icon: MonitorPlay },
        { name: t('sidebar.seats'), path: '/admin/seats', icon: Armchair },
        { name: t('sidebar.shows'), path: '/admin/shows', icon: CalendarClock },
      ],
    },
    {
      label: t('sidebar.sales'),
      items: [
        { name: t('sidebar.bookings'), path: '/admin/bookings', icon: Ticket },
        { name: t('sidebar.bookingSeats'), path: '/admin/booking-seats', icon: Airplay },
      ],
    },
    {
      label: t('sidebar.section.products'),
      items: [
        { name: t('sidebar.productCategories'), path: '/admin/product-categories', icon: Package },
        { name: t('sidebar.products'), path: '/admin/products', icon: Popcorn },
        { name: t('sidebar.orders'), path: '/admin/orders', icon: ShoppingCart },
        { name: t('sidebar.orderItems'), path: '/admin/order-items', icon: UtensilsCrossed },
      ],
    },
    {
      label: t('sidebar.section.payments'),
      items: [
        { name: t('sidebar.payments'), path: '/admin/payments', icon: CreditCard },
        { name: t('sidebar.paymentTransactions'), path: '/admin/payment-transactions', icon: ReceiptText },
      ],
    },
    {
      label: t('sidebar.administration'),
      items: [{ name: t('sidebar.users'), path: '/admin/users', icon: Users }],
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-hidden">
      {/* Top Section */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-sidebar-border shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#E50914] flex items-center justify-center shadow-lg shadow-[#E50914]/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-sidebar-foreground uppercase leading-tight">
                CINEMA<span className="text-[#E50914]">TIQUE</span>
              </h1>
              <span className="text-[10px] font-bold tracking-widest text-[#E50914] uppercase leading-relaxed block">
                {t('sidebar.adminPortal')}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-4 overflow-y-auto flex-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-relaxed">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.name}
                      className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all overflow-hidden ${
                        active
                          ? 'text-white'
                          : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                    >
                      {/* Active background */}
                      {active && (
                        <motion.div
                          layoutId="activeAdminNav"
                          className="absolute inset-0 bg-[#E50914] rounded-lg shadow-sm shadow-[#E50914]/20 z-0"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      
                      {/* Active Left Accent Indicator Bar */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-md bg-black/30 z-10" />
                      )}
                      
                      {/* Icon */}
                      <Icon
                        className={`relative z-10 w-4 h-4 shrink-0 transition-colors ${
                          active ? 'text-white' : 'text-muted-foreground'
                        }`}
                      />
                      
                      {/* Label Text */}
                      <span
                        className={`relative z-10 truncate leading-relaxed transition-colors ${
                          active ? 'text-white font-bold' : 'group-hover:text-sidebar-foreground'
                        }`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border space-y-2 shrink-0 bg-sidebar">
        {/* Back to Public Site */}
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="leading-relaxed truncate">{t('nav.viewPublicSite')}</span>
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="leading-relaxed truncate">{t('nav.settings')}</span>
        </Link>

        {/* User Card */}
        {user && (
          <div className="relative flex items-center justify-between p-2 rounded-xl bg-sidebar-accent border border-sidebar-border group">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt={user.username}
                className="w-8 h-8 rounded-lg object-cover border border-[#E50914] shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-bold text-sidebar-foreground truncate leading-tight">{user.username}</p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title={t('nav.signOut')}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};