import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { AppSettings, ThemeMode, StorageError } from '../types';
import {
  loadSettings,
  saveSettings as saveSettingsToStorage,
} from '../services/storage';
import { useToast } from '../hooks/useToast';

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  setDefaultBrowser: (packageName?: string) => Promise<void>;
  completeTutorial: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    tutorialCompleted: false,
    themeMode: 'system',
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadSettings()
      .then(data => setSettings(data))
      .catch((e: StorageError) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  /** 通用设置更新，合并 partial 并持久化 */
  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      const updated = { ...settings, ...partial };
      setSettings(updated);
      try {
        await saveSettingsToStorage(updated);
      } catch (e) {
        toast.error(e instanceof StorageError ? e.message : '保存设置失败');
        throw e;
      }
    },
    [settings, toast],
  );

  const setDefaultBrowser = useCallback(
    async (packageName?: string) => updateSettings({ defaultBrowser: packageName }),
    [updateSettings],
  );

  const completeTutorial = useCallback(
    async () => updateSettings({ tutorialCompleted: true }),
    [updateSettings],
  );

  const setThemeMode = useCallback(
    async (mode: ThemeMode) => updateSettings({ themeMode: mode }),
    [updateSettings],
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        setDefaultBrowser,
        completeTutorial,
        setThemeMode,
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
