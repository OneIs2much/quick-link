import * as Haptics from 'expo-haptics';

/**
 * 跨平台触觉反馈 hook。
 * expo-haptics SDK 55 在 Android 上通过 VIBRATE 权限实现振动，iOS 使用 Taptic Engine。
 */
export function useHaptics() {
  const light = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const medium = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  const heavy = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

  /** 通知类反馈：success / warning / error */
  const notification = (type: Haptics.NotificationFeedbackType) =>
    Haptics.notificationAsync(type);

  return { light, medium, heavy, notification };
}
