import { Alert } from 'react-native';

/**
 * 统一用户提示 hook，封装 Alert.alert 为语义化 API。
 * 避免各处散落的 Alert.alert 调用，便于后续替换为 Toast 组件。
 */
export function useToast() {
  const success = (message: string, onDismiss?: () => void) => {
    Alert.alert('成功', message, [{ text: '确定', onPress: onDismiss }]);
  };

  const error = (message: string) => {
    Alert.alert('错误', message, [{ text: '确定' }]);
  };

  /**
   * 二次确认对话框
   * @param title 标题
   * @param message 说明文字
   * @param onConfirm 用户点击确认后的回调
   * @param confirmLabel 确认按钮文字，默认"确定"
   * @param destructive 确认按钮是否为破坏性样式（红色）
   */
  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmLabel = '确定',
    destructive = false,
  ) => {
    Alert.alert(title, message, [
      { text: '取消', style: 'cancel' },
      { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
    ]);
  };

  return { success, error, confirm };
}
