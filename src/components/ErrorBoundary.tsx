import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIGHT_COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants/theme';

interface Props {
  children: ReactNode;
  /** 自定义降级 UI，不传则使用内置样式 */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 错误边界：捕获子树中的渲染错误，防止整个应用白屏。
 * 使用 class 组件实现，因为 getDerivedStateFromError 只能在 class 中使用。
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return <DefaultFallback error={this.state.error} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

function DefaultFallback({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  const C = LIGHT_COLORS;
  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <Ionicons name="warning-outline" size={56} color={C.error} />
      <Text style={[styles.title, { color: C.textPrimary }]}>出了点问题</Text>
      <Text style={[styles.message, { color: C.textSecondary }]}>
        {error?.message || '未知错误'}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: C.primary }]}
        onPress={onReset}
      >
        <Text style={[styles.buttonText, { color: C.textInverse }]}>重试</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
    gap: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  message: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  buttonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});
