import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface PasswordDialogProps {
  visible: boolean;
  linkName: string;
  onVerify: (password: string) => void;
  onCancel: () => void;
}

export function PasswordDialog({ visible, linkName, onVerify, onCancel }: PasswordDialogProps) {
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }
    onVerify(password);
    setPassword('');
    setError('');
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="lock-closed" size={36} color={colors.warning} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>需要密码</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            "{linkName}" 已设置密码保护
          </Text>

          <TextInput
            style={[
              styles.input,
              { borderColor: error ? colors.error : colors.border, color: colors.textPrimary },
            ]}
            placeholder="请输入访问密码"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            value={password}
            onChangeText={text => {
              setPassword(text);
              setError('');
            }}
            onSubmitEditing={handleSubmit}
            autoFocus
          />
          {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={[styles.confirmText, { color: colors.textInverse }]}>确认</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  dialog: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    fontSize: FONT_SIZE.lg,
    marginBottom: SPACING.sm,
  },
  error: {
    fontSize: FONT_SIZE.xs,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  confirmButton: {
    flex: 1,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { fontSize: FONT_SIZE.md, fontWeight: '600' },
});
