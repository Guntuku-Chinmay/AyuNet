import { create } from 'zustand';
import { storage } from '../utils/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  primaryColor: string;
  accentColor: string;
  setTheme: (theme: ThemeMode) => void;
  setBranding: (primaryColor: string, accentColor: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: storage.getItem<ThemeMode>('ayunet_theme', 'system'),
  primaryColor: storage.getItem<string>('ayunet_primary_color', '#0f766e'),
  accentColor: storage.getItem<string>('ayunet_accent_color', '#f59e0b'),

  setTheme: (theme) => {
    storage.setItem('ayunet_theme', theme);
    set({ theme });
  },

  setBranding: (primaryColor, accentColor) => {
    storage.setItem('ayunet_primary_color', primaryColor);
    storage.setItem('ayunet_accent_color', accentColor);
    set({ primaryColor, accentColor });
  },
}));
