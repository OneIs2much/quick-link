import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuickLink, AppSettings, StorageError } from '../types';

// ─── 存储键 ───────────────────────────────────────────────────────────────────

const LINKS_KEY = '@quick_link_links';
const SETTINGS_KEY = '@quick_link_settings';

// ─── 默认值 ───────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  tutorialCompleted: false,
  themeMode: 'system',
};

// ─── 导出数据结构（用于 import/export） ──────────────────────────────────────

interface ExportPayload {
  version: number;
  exportedAt: number;
  links: QuickLink[];
  settings: AppSettings;
}

// ─── 链接 CRUD ────────────────────────────────────────────────────────────────

/** 加载所有链接，按创建时间倒序排列 */
export async function loadLinks(): Promise<QuickLink[]> {
  try {
    const json = await AsyncStorage.getItem(LINKS_KEY);
    if (!json) return [];
    const links: QuickLink[] = JSON.parse(json);
    return links.sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    throw new StorageError('加载链接失败', e);
  }
}

/** 持久化链接列表（全量覆盖） */
export async function saveLinks(links: QuickLink[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LINKS_KEY, JSON.stringify(links));
  } catch (e) {
    throw new StorageError('保存链接失败', e);
  }
}

/** 新增链接，返回更新后的完整列表 */
export async function addLink(link: QuickLink): Promise<QuickLink[]> {
  const links = await loadLinks();
  links.unshift(link);
  await saveLinks(links);
  return links;
}

/** 更新链接，自动刷新 updatedAt，返回更新后的完整列表 */
export async function updateLink(updated: QuickLink): Promise<QuickLink[]> {
  const links = await loadLinks();
  const index = links.findIndex(l => l.id === updated.id);
  if (index !== -1) {
    links[index] = { ...updated, updatedAt: Date.now() };
  }
  await saveLinks(links);
  return links;
}

/** 删除链接，返回更新后的完整列表 */
export async function deleteLink(id: string): Promise<QuickLink[]> {
  const links = await loadLinks();
  const filtered = links.filter(l => l.id !== id);
  await saveLinks(filtered);
  return filtered;
}

// ─── 设置 ─────────────────────────────────────────────────────────────────────

/** 加载设置，缺失字段用默认值补全（向后兼容旧数据） */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!json) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
  } catch (e) {
    throw new StorageError('加载设置失败', e);
  }
}

/** 持久化设置 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    throw new StorageError('保存设置失败', e);
  }
}

// ─── 数据管理 ─────────────────────────────────────────────────────────────────

/** 清除所有数据（链接 + 设置） */
export async function clearAllData(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(LINKS_KEY),
      AsyncStorage.removeItem(SETTINGS_KEY),
    ]);
  } catch (e) {
    throw new StorageError('清除数据失败', e);
  }
}

/**
 * 导出所有数据为 JSON 字符串。
 * 格式：ExportPayload，version 字段用于未来迁移兼容。
 */
export async function exportData(): Promise<string> {
  const [links, settings] = await Promise.all([loadLinks(), loadSettings()]);
  const payload: ExportPayload = {
    version: 1,
    exportedAt: Date.now(),
    links,
    settings,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * 从 JSON 字符串导入数据，合并到现有数据（以 id 去重，导入的覆盖本地）。
 * @throws StorageError 如果 JSON 格式无效或版本不兼容
 */
export async function importData(json: string): Promise<void> {
  let payload: ExportPayload;
  try {
    payload = JSON.parse(json);
  } catch {
    throw new StorageError('导入失败：文件格式无效');
  }

  if (!payload.version || !Array.isArray(payload.links)) {
    throw new StorageError('导入失败：文件内容不完整');
  }

  const existingLinks = await loadLinks();
  const existingMap = new Map(existingLinks.map(l => [l.id, l]));

  for (const link of payload.links) {
    existingMap.set(link.id, link);
  }

  await saveLinks(Array.from(existingMap.values()));

  if (payload.settings) {
    const currentSettings = await loadSettings();
    await saveSettings({ ...currentSettings, ...payload.settings });
  }
}
