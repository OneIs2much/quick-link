// ─── 领域模型 ────────────────────────────────────────────────────────────────

/** 快捷链接实体 */
export interface QuickLink {
  id: string;
  name: string;
  url: string;
  /** 图标内容：emoji 字符 / Ionicons 图标名 / 文字首字母 */
  icon: string;
  iconType: 'emoji' | 'icon' | 'text';
  /** 指定打开的浏览器包名，undefined 表示使用全局默认 */
  browserPackage?: string;
  /** 访问密码，undefined 表示无密码保护 */
  password?: string;
  /** 分类标签，undefined 表示未分类 */
  category?: string;
  createdAt: number;
  updatedAt: number;
}

/** 应用全局设置 */
export interface AppSettings {
  /** 全局默认浏览器包名，undefined 表示系统默认 */
  defaultBrowser?: string;
  tutorialCompleted: boolean;
  /** 主题模式：跟随系统 / 强制浅色 / 强制深色 */
  themeMode: ThemeMode;
}

// ─── 主题 ────────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

/** 主题颜色 token，light/dark 两套均实现此接口 */
export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;

  background: string;
  surface: string;
  surfaceSecondary: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  border: string;
  borderLight: string;
  divider: string;

  shadow: string;
  overlay: string;
}

// ─── 浏览器 ──────────────────────────────────────────────────────────────────

export interface BrowserInfo {
  packageName: string;
  name: string;
  /** Ionicons 图标名 */
  icon: string;
}

// ─── 导航 ────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Home: undefined;
  AddEditLink: { linkId?: string };
  Settings: undefined;
  Tutorial: undefined;
};

// ─── 错误类型 ────────────────────────────────────────────────────────────────

/** 存储层操作失败时抛出，携带原始 cause 便于上层决策 */
export class StorageError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}

// ─── 快捷方式 ────────────────────────────────────────────────────────────────

/** addLinkToHomeScreen 的返回状态 */
export type ShortcutResult = 'success' | 'unsupported' | 'error';
