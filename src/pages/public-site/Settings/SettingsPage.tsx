import React from 'react';
import { Palette, Shield, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { PageContainer } from '@/components/layout/PageContainer';

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, title, description, children }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 first:pt-0 border-b border-border last:border-0">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-border flex items-center justify-center text-[#E50914] shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-md">{description}</p>
        </div>
      </div>
      <div className="pl-13 sm:pl-0">{children}</div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  return (
    <PageContainer className="py-12 space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-[#E50914]">
          <Palette className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Preferences</span>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Customize your Cinematique experience. Preferences are saved on this device.
        </p>
      </div>

      {/* More settings (placeholders for future preferences) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8 space-y-2"
      >
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-2">General</h2>
        <SettingRow
          icon={<Bell className="w-5 h-5" />}
          title="Notifications"
          description="Email me about new premieres, showtimes, and exclusive offers."
        >
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-border accent-[#E50914]"
            />
            <span className="ml-2 text-xs text-muted-foreground">Enabled</span>
          </label>
        </SettingRow>
        <SettingRow
          icon={<Shield className="w-5 h-5" />}
          title="Account & Security"
          description="Manage your password, email, and sign-in preferences."
        >
          <span className="text-xs text-muted-foreground">Coming soon</span>
        </SettingRow>
      </motion.div>
    </PageContainer>
  );
};
