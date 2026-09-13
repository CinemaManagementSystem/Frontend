import { create } from 'zustand';

export type AppLanguage = 'en' | 'km' | 'fr';

interface SettingsPreferences {
  notifications: boolean;
  language: AppLanguage;
}

interface SettingsStore extends SettingsPreferences {
  setNotifications: (value: boolean) => void;
  setLanguage: (value: AppLanguage) => void;
  resetPreferences: () => void;
}

const STORAGE_KEY = 'settings-preferences';

const DEFAULTS: SettingsPreferences = {
  notifications: true,
  language: 'en',
};

function isLanguage(value: unknown): value is AppLanguage {
  return value === 'en' || value === 'km' || value === 'fr';
}

function loadPreferences(): SettingsPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<SettingsPreferences>;
    return {
      notifications:
        typeof parsed.notifications === 'boolean' ? parsed.notifications : DEFAULTS.notifications,
      language: isLanguage(parsed.language) ? parsed.language : DEFAULTS.language,
    };
  } catch {
    return DEFAULTS;
  }
}

function persist({ notifications, language }: SettingsPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ notifications, language }));
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...loadPreferences(),

  setNotifications: (notifications) => {
    set({ notifications });
    const { language } = get();
    persist({ notifications, language });
  },

  setLanguage: (language) => {
    set({ language });
    const { notifications } = get();
    persist({ notifications, language });
  },

  resetPreferences: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ ...DEFAULTS });
  },
}));