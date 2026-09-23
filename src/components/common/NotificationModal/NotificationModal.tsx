import { Bell, BellRing, LogIn, PackageSearch, UserPlus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type NotificationTab = 'announcements' | 'orders';

interface NotificationModalProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onCreateAccount: () => void;
  triggerLabel: string;
}

export function NotificationModal({
  isAuthenticated,
  onSignIn,
  onCreateAccount,
  triggerLabel,
}: NotificationModalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationTab>('announcements');
  const isOrdersTab = activeTab === 'orders';

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const guestMessage = isOrdersTab
    ? 'Sign in to receive updates about your bookings, payments, and ticket collection.'
    : 'Create an account to receive cinema news and offers selected for you.';
  const memberMessage = isOrdersTab
    ? 'Your booking, payment, and ticket updates will appear here.'
    : 'Cinema announcements and new offers will appear here.';

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className="relative icon-btn-circle"
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Bell className="h-4 w-4" />
        <span className="notification-dot" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 top-[calc(100%+0.75rem)] z-[80] w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/15 bg-black/95 p-5 text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-black tracking-tight">Notifications</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
                className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-7">
        <div className="flex gap-2" role="tablist" aria-label="Notification categories">
          <button
            type="button"
            role="tab"
            id="notification-announcements-tab"
            aria-selected={!isOrdersTab}
            aria-controls="notification-panel"
            onClick={() => setActiveTab('announcements')}
            className={`min-h-10 rounded-full border px-5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              !isOrdersTab ? 'border-white/20 bg-white/15 text-white' : 'border-border bg-transparent text-muted-foreground hover:border-white/25 hover:text-foreground'
            }`}
          >
            Announcements
          </button>
          <button
            type="button"
            role="tab"
            id="notification-orders-tab"
            aria-selected={isOrdersTab}
            aria-controls="notification-panel"
            onClick={() => setActiveTab('orders')}
            className={`min-h-10 rounded-full border px-5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              isOrdersTab ? 'border-white/20 bg-white/15 text-white' : 'border-border bg-transparent text-muted-foreground hover:border-white/25 hover:text-foreground'
            }`}
          >
            Orders
          </button>
        </div>

              <section id="notification-panel" role="tabpanel" aria-labelledby={isOrdersTab ? 'notification-orders-tab' : 'notification-announcements-tab'} className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary">
            {isOrdersTab ? <PackageSearch className="h-7 w-7" aria-hidden="true" /> : <BellRing className="h-7 w-7" aria-hidden="true" />}
          </span>
          <h4 className="mt-5 text-lg font-black text-foreground">
            {isAuthenticated ? (isOrdersTab ? 'No order updates yet' : 'No announcements yet') : 'Keep your cinema updates in one place'}
          </h4>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {isAuthenticated ? memberMessage : guestMessage}
          </p>

          {!isAuthenticated && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => { setIsOpen(false); onSignIn(); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                <LogIn className="h-4 w-4" aria-hidden="true" /> Sign in
              </button>
              <button type="button" onClick={() => { setIsOpen(false); onCreateAccount(); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black">
                <UserPlus className="h-4 w-4" aria-hidden="true" /> Create account
              </button>
            </div>
          )}
        </section>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
