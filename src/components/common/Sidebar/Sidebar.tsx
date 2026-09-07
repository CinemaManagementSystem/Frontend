import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  ReceiptText,
  LogOut,
  Settings,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

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

  const sections: MenuSection[] = [
    {
      label: 'Cinema',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Categories', path: '/admin/movie-categories', icon: Tags },
        { name: 'Movies', path: '/admin/movies', icon: Clapperboard },
        { name: 'Locations', path: '/admin/locations', icon: MapPin },
        { name: 'Theaters', path: '/admin/theaters', icon: Building2 },
        { name: 'Screens', path: '/admin/screens', icon: MonitorPlay },
        { name: 'Seats', path: '/admin/seats', icon: Armchair },
        { name: 'Shows', path: '/admin/shows', icon: CalendarClock },
      ],
    },
    {
      label: 'Sales',
      items: [
        { name: 'Bookings', path: '/admin/bookings', icon: Ticket },
        { name: 'Booking Seats', path: '/admin/booking-seats', icon: Armchair },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
        { name: 'Order Items', path: '/admin/order-items', icon: UtensilsCrossed },
      ],
    },
    {
      label: 'Products',
      items: [
        { name: 'Product Categories', path: '/admin/product-categories', icon: Package },
        { name: 'Products', path: '/admin/products', icon: Popcorn },
      ],
    },
    {
      label: 'Payments',
      items: [
        { name: 'Payments', path: '/admin/payments', icon: CreditCard },
        { name: 'Payment Transactions', path: '/admin/payment-transactions', icon: ReceiptText },
      ],
    },
    {
      label: 'Administration',
      items: [{ name: 'Users', path: '/admin/users', icon: Users }],
    },
  ];

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isActive = (path: string) => location.pathname === path;
  const isSectionActive = (section: MenuSection) =>
    section.items.some((item) => isActive(item.path));

  const toggleSection = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-hidden">
      {/* Top Section */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-sidebar-border shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#E50914] flex items-center justify-center shadow-md shadow-[#E50914]/25 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-sidebar-foreground uppercase leading-tight">
                CINEMA<span className="text-[#E50914]">TIQUE</span>
              </h1>
              <span className="text-[10px] font-bold tracking-widest text-[#E50914] uppercase leading-relaxed block">
                Admin Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1.5 overflow-y-auto flex-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
          {sections.map((section) => {
            const open = !collapsed[section.label];
            const sectionActive = isSectionActive(section);
            return (
              <div key={section.label} className="rounded-lg">
                <button
                  onClick={() => toggleSection(section.label)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors',
                    sectionActive ? 'text-sidebar-foreground' : 'text-muted-foreground hover:text-sidebar-foreground',
                  )}
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    className={cn('w-3.5 h-3.5 transition-transform', open ? '' : '-rotate-90')}
                  />
                </button>
                {open && (
                  <div className="space-y-0.5 mt-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          title={item.name}
                          className={cn(
                            'relative flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                            active
                              ? 'bg-[#E50914]/15 text-[#E50914] font-semibold'
                              : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
                          )}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-md bg-[#E50914]" />
                          )}
                          <Icon
                            className={cn('w-4 h-4 shrink-0', active ? 'text-[#E50914]' : 'text-muted-foreground')}
                          />
                          <span className="truncate leading-relaxed">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border space-y-2 shrink-0 bg-sidebar">
        {/* Settings */}
        <Link
          to="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Settings className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="leading-relaxed truncate">Settings</span>
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
              title="Sign Out"
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
