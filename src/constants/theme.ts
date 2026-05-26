import { ThemeColors } from '../types';

// ─── 颜色 token ───────────────────────────────────────────────────────────────

export const LIGHT_COLORS: ThemeColors = {
  primary: '#4A90D9',
  primaryDark: '#357ABD',
  primaryLight: '#E8F1FB',
  secondary: '#6C63FF',
  accent: '#FF6B6B',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',

  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F9FC',

  textPrimary: '#1A1D26',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#EEEEEE',

  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const DARK_COLORS: ThemeColors = {
  primary: '#5BA3E8',
  primaryDark: '#4A90D9',
  primaryLight: '#1A2D42',
  secondary: '#8B84FF',
  accent: '#FF8080',
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',

  background: '#0F1117',
  surface: '#1C1F2A',
  surfaceSecondary: '#252836',

  textPrimary: '#F0F2F8',
  textSecondary: '#9BA3B5',
  textTertiary: '#6B7280',
  textInverse: '#1A1D26',

  border: '#2E3244',
  borderLight: '#252836',
  divider: '#2A2D3E',

  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

/** 向后兼容：默认导出浅色主题，新代码应通过 useTheme().colors 获取 */
export const COLORS = LIGHT_COLORS;

// ─── 间距 ─────────────────────────────────────────────────────────────────────

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ─── 字号 ─────────────────────────────────────────────────────────────────────

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

// ─── 圆角 ─────────────────────────────────────────────────────────────────────

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

// ─── 阴影（与颜色无关，light/dark 通用） ──────────────────────────────────────

export const SHADOWS = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};
