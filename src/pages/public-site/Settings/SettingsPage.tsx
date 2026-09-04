import React from 'react';
import { Sun, Moon, Monitor, Palette, Shield, Bell, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme, type Theme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

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

interface ThemeOptionProps {
  value: Theme;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ value, label, icon, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center gap-2 w-24 py-4 rounded-2xl border text-xs font-semibold transition-all',
        active
          ? 'border-[#E50914] bg-accent/10 text-[#E50914] shadow-sm'
          : 'border-border bg-muted/50 text-muted-foreground hover:border-accent/40 hover:text-foreground',
      )}
    >
      {active && (
        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#E50914] text-white flex items-center justify-center">
          <Check className="w-3 h-3" />
        </span>
      )}
      <span className="text-muted-foreground">{icon}</span>
      <span className="uppercase tracking-wider text-[10px]">{label}</span>
      <span
        className={cn('w-8 h-1.5 rounded-full mt-0.5', {
          'bg-white border border-border': value === 'light',
          'bg-[#0f0f10] border border-border': value === 'dark',
        })}
      />
    </button>
  );
};

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" /> },
    { value: 'light', label: 'Light', icon: <Sun className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
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

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8 space-y-2"
      >
        <SettingRow
          icon={<Monitor className="w-5 h-5" />}
          title="Theme Mode"
          description="Choose whether Cinematique uses a light or dark appearance."
        >
          <div className="flex items-center gap-2">
            {themes.map(({ value, label, icon }) => (
              <ThemeOption
                key={value}
                value={value}
                label={label}
                icon={icon}
                active={theme === value}
                onClick={() => setTheme(value)}
              />
            ))}
          </div>
        </SettingRow>
      </motion.div>

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
    </div>
  );
};