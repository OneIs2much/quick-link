import { Platform } from 'react-native';
import { requestPinShortcut } from '../../modules/shortcut-manager';
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
 * 是否在 UI 中显示"添加到桌面"入口。
 *
 * 只要是 Android 平台就显示，不在此处检查 native module 是否已加载。
 * 实际能力检查在 addLinkToHomeScreen 执行时进行，不支持时会返回 'unsupported'。
 * 这样用户能看到入口，点击后若设备不支持会收到明确提示，而非选项直接消失。
 */
export function canAddToHomeScreen(): boolean {
  return Platform.OS === 'android';
}
