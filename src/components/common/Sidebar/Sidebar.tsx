import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { LogoutModal } from "@/components/common/LogoutModal/LogoutModal";
import { useToast } from "@/components/ui/Toast/Toast";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { cn } from "@/lib/utils";

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
  const toast = useToast();
  const { user, logoutAsync, isLoggingOut } = useAuthStore();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAsync();
    setLogoutOpen(false);
    toast.success("Successfully logged out");
    navigate("/login");
  };

  const sections: MenuSection[] = [
    {
      label: "Cinema",
      items: [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Categories", path: "/admin/movie-categories", icon: Tags },
        { name: "Movies", path: "/admin/movies", icon: Clapperboard },
        { name: "Locations", path: "/admin/locations", icon: MapPin },
        { name: "Theaters", path: "/admin/theaters", icon: Building2 },
        { name: "Screens", path: "/admin/screens", icon: MonitorPlay },
        { name: "Seats", path: "/admin/seats", icon: Armchair },
        { name: "Shows", path: "/admin/shows", icon: CalendarClock },
      ],
    },
    {
      label: "Sales",
      items: [
        { name: "Bookings", path: "/admin/bookings", icon: Ticket },
        { name: "Booking Seats", path: "/admin/booking-seats", icon: Armchair },
        { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
        {
          name: "Order Items",
          path: "/admin/order-items",
          icon: UtensilsCrossed,
        },
      ],
    },
    {
      label: "Products",
      items: [
        {
          name: "Product Categories",
          path: "/admin/product-categories",
          icon: Package,
        },
        { name: "Products", path: "/admin/products", icon: Popcorn },
      ],
    },
    {
      label: "Payments",
      items: [
        { name: "Payments", path: "/admin/payments", icon: CreditCard },
        {
          name: "Payment Transactions",
          path: "/admin/payment-transactions",
          icon: ReceiptText,
        },
      ],
    },
    {
      label: "Administration",
      items: [
        { name: "Users", path: "/admin/users", icon: Users },
        { name: "Security Page", path: "/admin/security", icon: ShieldCheck },
      ],
    },
  ].filter((section) => section.items.length > 0);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === "/admin/security" && location.pathname === "/admin/audit-logs");
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
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((section) => {
            const open = !collapsed[section.label];
            const sectionActive = isSectionActive(section);
            return (
              <div key={section.label} className="rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection(section.label)}
                  className={cn(
                    "grid h-8 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-3 text-[10px] font-bold uppercase leading-none tracking-wider transition-colors",
                    sectionActive
                      ? "text-sidebar-foreground"
                      : "text-muted-foreground hover:text-sidebar-foreground",
                  )}
                >
                  <span className="truncate text-left">{section.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 justify-self-end transition-transform",
                      open ? "" : "-rotate-90",
                    )}
                  />
                </button>
                {open && (
                  <div className="mt-0.5 space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          title={item.name}
                          className={cn(
                            "relative flex h-9 items-center gap-3 rounded-md px-3 text-xs font-medium leading-none transition-colors",
                            active
                              ? "bg-[#E50914]/15 text-[#E50914] font-semibold"
                              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
                          )}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-md bg-[#E50914]" />
                          )}
                          <Icon
                            className={cn(
                              "w-4 h-4 shrink-0",
                              active
                                ? "text-[#E50914]"
                                : "text-muted-foreground",
                            )}
                          />
                          <span className="truncate leading-relaxed">
                            {item.name}
                          </span>
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
      <div className="shrink-0 space-y-2 border-t border-sidebar-border bg-sidebar p-3">
        {/* Settings */}
        <Link
          to="/admin/settings"
          className="flex h-9 items-center gap-3 rounded-lg px-3 text-xs font-semibold leading-none text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">Settings</span>
        </Link>

        {/* User Card */}
        {user && (
          <div className="relative flex min-w-0 items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent p-2">
            <Link
              to="/admin/settings"
              title="Open profile settings"
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 transition hover:bg-sidebar/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
            >
              <Avatar
                src={user.avatar}
                alt={user.username}
                className="h-8 w-8 shrink-0 border border-[#E50914]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold leading-tight text-sidebar-foreground">
                  {user.name ?? user.username}
                </p>
                <p className="truncate text-[10px] leading-tight text-muted-foreground">
                  {user.email}
                </p>
                <p className="truncate text-[9px] font-bold uppercase leading-tight tracking-wider text-[#E50914]">
                  {user.role}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              title="Sign out"
              aria-label="Sign out"
              className="flex h-9 w-9 min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <LogoutModal
        isOpen={logoutOpen}
        isLoading={isLoggingOut}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </aside>
  );
};
