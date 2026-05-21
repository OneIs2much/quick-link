import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuickLink, AppSettings } from '../types';

const LINKS_KEY = '@quick_link_links';
const SETTINGS_KEY = '@quick_link_settings';

const DEFAULT_SETTINGS: AppSettings = {
  tutorialCompleted: false,
  biometricEnabled: false,
};

export async function loadLinks(): Promise<QuickLink[]> {
  try {
    const json = await AsyncStorage.getItem(LINKS_KEY);
    if (json) {
      const links: QuickLink[] = JSON.parse(json);
      return links.sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch (e) {
    console.error('Failed to load links:', e);
  }
  return [];
}

export async function saveLinks(links: QuickLink[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LINKS_KEY, JSON.stringify(links));
  } catch (e) {
    console.error('Failed to save links:', e);
  }
}

export async function addLink(link: QuickLink): Promise<QuickLink[]> {
  const links = await loadLinks();
  links.unshift(link);
  await saveLinks(links);
  return links;
}

export async function updateLink(updated: QuickLink): Promise<QuickLink[]> {
  const links = await loadLinks();
  const index = links.findIndex(l => l.id === updated.id);
  if (index !== -1) {
    links[index] = { ...updated, updatedAt: Date.now() };
  }
  await saveLinks(links);
  return links;
}

export async function deleteLink(id: string): Promise<QuickLink[]> {
  const links = await loadLinks();
  const filtered = links.filter(l => l.id !== id);
  await saveLinks(filtered);
  return filtered;
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LINKS_KEY);
    await AsyncStorage.removeItem(SETTINGS_KEY);
  } catch (e) {
    console.error('Failed to clear data:', e);
  }
}
