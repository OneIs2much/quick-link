import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { Platform } from 'react-native';

export function useHaptics() {
  const light = () => {
    if (Platform.OS === 'ios') {
      impactAsync(ImpactFeedbackStyle.Light);
    }
  };

  const medium = () => {
    if (Platform.OS === 'ios') {
      impactAsync(ImpactFeedbackStyle.Medium);
    }
  };

  const heavy = () => {
    if (Platform.OS === 'ios') {
      impactAsync(ImpactFeedbackStyle.Heavy);
    }
  };

  return { light, medium, heavy };
}
