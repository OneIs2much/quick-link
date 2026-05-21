import { Platform } from 'react-native';

export async function createHomeShortcut(
  id: string,
  name: string,
  url: string,
  iconEmoji: string
): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      const { NativeModules } = require('react-native');
      if (NativeModules.ShortcutManager) {
        await NativeModules.ShortcutManager.createShortcut(
          id,
          name,
          url,
          iconEmoji
        );
      }
    } catch (e) {
      console.warn('Shortcut creation via native module failed:', e);
    }
  }
}

export async function removeHomeShortcut(id: string): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      const { NativeModules } = require('react-native');
      if (NativeModules.ShortcutManager) {
        await NativeModules.ShortcutManager.removeShortcut(id);
      }
    } catch (e) {
      console.warn('Shortcut removal via native module failed:', e);
    }
  }
}

export async function pinToHomeScreen(
  id: string,
  shortLabel: string,
  longLabel: string,
  iconEmoji: string,
  url: string
): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      const intent = {
        action: 'android.intent.action.VIEW',
        data: `quicklink://open/${id}`,
        flags: 268435456,
      };

      const { NativeModules } = require('react-native');
      if (NativeModules.ShortcutHelper) {
        await NativeModules.ShortcutHelper.requestPinShortcut(
          id,
          shortLabel,
          iconEmoji,
          intent
        );
      }
    } catch (e) {
      console.warn('Pin shortcut failed:', e);
    }
  }
}
