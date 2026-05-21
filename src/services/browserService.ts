import { Platform } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";
import * as WebBrowser from "expo-web-browser";
import { normalizeUrl } from "../utils/validators";

export async function openLinkInBrowser(
  url: string,
  browserPackage?: string,
): Promise<void> {
  const normalizedUrl = normalizeUrl(url);

  if (Platform.OS === "android" && browserPackage) {
    try {
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: normalizedUrl,
        flags: 1,
        packageName:
          browserPackage === "com.android.chrome" ? undefined : browserPackage,
      });
    } catch {
      await WebBrowser.openBrowserAsync(normalizedUrl);
    }
  } else {
    await WebBrowser.openBrowserAsync(normalizedUrl);
  }
}

export async function openLinkWithChooser(url: string): Promise<void> {
  const normalizedUrl = normalizeUrl(url);

  if (Platform.OS === "android") {
    try {
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: normalizedUrl,
        flags: 1,
      });
    } catch {
      await WebBrowser.openBrowserAsync(normalizedUrl);
    }
  } else {
    await WebBrowser.openBrowserAsync(normalizedUrl);
  }
}
