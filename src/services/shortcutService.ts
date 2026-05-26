import { Platform } from 'react-native';
import { requestPinShortcut, isPinShortcutSupported } from '../../modules/shortcut-manager';
import { ShortcutResult } from '../types';

/**
 * 将链接添加到 Android 桌面（Pinned Shortcut）。
 *
 * 调用后系统会弹出确认对话框，用户确认后快捷方式出现在桌面。
 * 点击桌面快捷方式会通过 deep link（quicklink://open/{id}）打开 App。
 *
 * @param id   链接唯一标识
 * @param name 快捷方式显示名称
 * @returns    操作结果：
 *   - 'success'     已发起请求（系统对话框已弹出）
 *   - 'unsupported' 平台不支持（非 Android 或 Android < 8.0）
 *   - 'error'       调用过程中发生异常
 */
export async function addLinkToHomeScreen(
  id: string,
  name: string,
): Promise<ShortcutResult> {
  if (Platform.OS !== 'android') return 'unsupported';

  try {
    const ok = await requestPinShortcut(id, name);
    return ok ? 'success' : 'unsupported';
  } catch {
    return 'error';
  }
}

/**
 * 检查当前设备是否支持将链接添加到桌面。
 * 可用于决定是否在 UI 中显示"添加到桌面"按钮。
 */
export function canAddToHomeScreen(): boolean {
  if (Platform.OS !== 'android') return false;
  return isPinShortcutSupported();
}
