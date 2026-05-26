import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, ThemeMode } from '../types';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';

interface ThemeContextType {
  /** 当前生效的颜色 token（已根据 themeMode + 系统主题计算） */
  colors: ThemeColors;
  /** 用户设置的主题模式 */
  themeMode: ThemeMode;
  /** 当前实际渲染的主题（light 或 dark，排除 system） */
  resolvedTheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  /** 初始主题模式，由 SettingsContext 传入以保持同步 */
  initialMode?: ThemeMode;
  /** 主题变更时的回调，用于同步到 SettingsContext */
  onModeChange?: (mode: ThemeMode) => void;
}

export function ThemeProvider({
  children,
  initialMode = 'system',
  onModeChange,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialMode);

  // 当外部 initialMode 变化时（SettingsContext 加载完成后）同步
  useEffect(() => {
    setThemeModeState(initialMode);
  }, [initialMode]);

  const resolvedTheme: 'light' | 'dark' =
    themeMode === 'system'
      ? (systemScheme === 'dark' ? 'dark' : 'light')
      : themeMode;

  const colors = resolvedTheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      onModeChange?.(mode);
    },
    [onModeChange],
  );

  return (
    <ThemeContext.Provider value={{ colors, themeMode, resolvedTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
