import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppSettings } from '../types';
import { loadSettings, saveSettings as saveSettingsToStorage } from '../services/storage';

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  setDefaultBrowser: (packageName?: string) => Promise<void>;
  completeTutorial: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    tutorialCompleted: false,
    biometricEnabled: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings().then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await saveSettingsToStorage(updated);
  }, [settings]);

  const setDefaultBrowser = useCallback(async (packageName?: string) => {
    const updated = { ...settings, defaultBrowser: packageName };
    setSettings(updated);
    await saveSettingsToStorage(updated);
  }, [settings]);

  const completeTutorial = useCallback(async () => {
    const updated = { ...settings, tutorialCompleted: true };
    setSettings(updated);
    await saveSettingsToStorage(updated);
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        setDefaultBrowser,
        completeTutorial,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
