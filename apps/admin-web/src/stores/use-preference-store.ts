import { create } from 'zustand';
import { storage } from '../utils/storage';

export interface UserPreferences {
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  emailAlerts: boolean;
  pushAlerts: boolean;
  compactMode: boolean;
}

interface PreferenceState {
  preferences: UserPreferences;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  emailAlerts: true,
  pushAlerts: true,
  compactMode: false,
};

export const usePreferenceStore = create<PreferenceState>((set) => ({
  preferences: storage.getItem<UserPreferences>('ayunet_user_preferences', DEFAULT_PREFERENCES),

  updatePreferences: (newPrefs) =>
    set((state) => {
      const updated = { ...state.preferences, ...newPrefs };
      storage.setItem('ayunet_user_preferences', updated);
      return { preferences: updated };
    }),
}));
