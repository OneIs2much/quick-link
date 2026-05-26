import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

// ─── Native module 接口 ───────────────────────────────────────────────────────

interface ShortcutManagerNativeModule {
  /**
   * 请求将链接固定到 Android 桌面，弹出系统确认对话框。
   * @param id     shortcut 唯一 id
   * @param name   显示名称
   * @param linkId 用于构造 deep link 的链接 id
   * @returns      true 表示系统支持且已发起请求
   */
  requestPinShortcut(id: string, name: string, linkId: string): Promise<boolean>;

  /** 检查设备是否支持 Pinned Shortcut（Android 8.0+） */
  isSupported(): boolean;
}

// requireOptionalNativeModule 在模块未注册时返回 null 而非抛出异常，
// 适用于 Expo Go / 未 prebuild 的环境，避免启动崩溃。
const NativeShortcutManager: ShortcutManagerNativeModule | null =
  Platform.OS === 'android'
    ? requireOptionalNativeModule<ShortcutManagerNativeModule>('ShortcutManager')
    : null;

// ─── 公开 API ─────────────────────────────────────────────────────────────────

/**
 * 请求将链接固定到 Android 桌面（Pinned Shortcut）。
 * 会弹出系统对话框让用户确认，用户确认后快捷方式出现在桌面。
 *
 * @param id     链接唯一标识（同时作为 shortcut id）
 * @param name   快捷方式显示名称
 * @returns      true 表示系统支持且已发起请求；false 表示不支持
 */
export async function requestPinShortcut(
  id: string,
  name: string,
): Promise<boolean> {
  if (!NativeShortcutManager) return false;
  return NativeShortcutManager.requestPinShortcut(id, name, id);
}

/**
 * 检查当前设备是否支持 Pinned Shortcut。
 * 可用于决定是否在 UI 中显示"添加到桌面"按钮。
 */
export function isPinShortcutSupported(): boolean {
  if (!NativeShortcutManager) return false;
  return NativeShortcutManager.isSupported();
}
