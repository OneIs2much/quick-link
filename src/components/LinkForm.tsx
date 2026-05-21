import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { DEFAULT_ICONS, ICON_OPTIONS } from '../constants/browsers';
import { BrowserPicker } from './BrowserPicker';
import { QuickLink, BrowserInfo } from '../types';

interface LinkFormProps {
  initialValues?: Partial<QuickLink>;
  onSubmit: (data: Omit<QuickLink, 'id' | 'createdAt' | 'updatedAt'>) => void;
  submitLabel: string;
}

export function LinkForm({ initialValues, onSubmit, submitLabel }: LinkFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [url, setUrl] = useState(initialValues?.url || '');
  const [icon, setIcon] = useState(initialValues?.icon || DEFAULT_ICONS[0]);
  const [iconType, setIconType] = useState<'emoji' | 'icon' | 'text'>(initialValues?.iconType || 'emoji');
  const [browserPackage, setBrowserPackage] = useState(initialValues?.browserPackage);
  const [browserName, setBrowserName] = useState('');
  const [password, setPassword] = useState(initialValues?.password || '');
  const [showBrowserPicker, setShowBrowserPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string; url?: string } = {};
    if (!name.trim()) newErrors.name = '请输入链接名称';
    if (!url.trim()) newErrors.url = '请输入链接地址';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      url: url.trim(),
      icon,
      iconType,
      browserPackage,
      password: password.trim() || undefined,
    });
  };

  const handleBrowserSelect = (browser?: BrowserInfo) => {
    setShowBrowserPicker(false);
    if (browser) {
      setBrowserPackage(browser.packageName);
      setBrowserName(browser.name);
    } else {
      setBrowserPackage(undefined);
      setBrowserName('');
    }
  };

  const selectedIconTypeConfig = ICON_OPTIONS.find(o => o.type === iconType);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>图标</Text>
          <View style={styles.iconTypeRow}>
            {ICON_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.type}
                style={[
                  styles.iconTypeChip,
                  iconType === opt.type && styles.iconTypeChipActive,
                ]}
                onPress={() => {
                  setIconType(opt.type);
                  if (opt.type === 'emoji') setIcon(DEFAULT_ICONS[0]);
                  else if (opt.type === 'icon') setIcon('link');
                  else setIcon('');
                }}
              >
                <Text
                  style={[
                    styles.iconTypeText,
                    iconType === opt.type && styles.iconTypeTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {iconType === 'emoji' && (
            <View style={styles.emojiGrid}>
              {DEFAULT_ICONS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiItem,
                    icon === emoji && styles.emojiItemActive,
                  ]}
                  onPress={() => setIcon(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {iconType === 'icon' && (
            <View style={styles.previewContainer}>
              <View style={styles.previewIcon}>
                <Ionicons
                  name={(icon as keyof typeof Ionicons.glyphMap) || 'link'}
                  size={32}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.previewLabel}>图标: link</Text>
            </View>
          )}

          {iconType === 'text' && (
            <View style={styles.previewContainer}>
              <View style={[styles.previewIcon, styles.previewIconText]}>
                <Text style={styles.previewText}>
                  {name ? name.charAt(0).toUpperCase() : 'A'}
                </Text>
              </View>
              <Text style={styles.previewLabel}>将取名称首字符作为图标</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本信息</Text>

          <Text style={styles.label}>链接名称</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="例如：我的博客"
            placeholderTextColor={COLORS.textTertiary}
            value={name}
            onChangeText={text => {
              setName(text);
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
            }}
            maxLength={20}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          <Text style={styles.label}>链接地址 (URL)</Text>
          <TextInput
            style={[styles.input, errors.url ? styles.inputError : null]}
            placeholder="例如：https://example.com"
            placeholderTextColor={COLORS.textTertiary}
            value={url}
            onChangeText={text => {
              setUrl(text);
              if (errors.url) setErrors(prev => ({ ...prev, url: undefined }));
            }}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.url ? <Text style={styles.errorText}>{errors.url}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>浏览器设置</Text>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setShowBrowserPicker(true)}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="compass" size={22} color={COLORS.primary} />
              <Text style={styles.optionLabel}>
                {browserName || '选择浏览器'}
              </Text>
            </View>
            <View style={styles.optionRight}>
              {browserName ? (
                <View style={styles.flexRow}>
                  <Text style={styles.optionValue}>{browserName}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setBrowserPackage(undefined);
                      setBrowserName('');
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.optionValue}>系统默认</Text>
              )}
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>安全设置</Text>
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Ionicons name="lock-closed" size={22} color={COLORS.warning} />
              <Text style={styles.optionLabel}>访问密码</Text>
            </View>
            <View style={styles.optionRight}>
              {showPassword ? (
                <TextInput
                  style={styles.passwordInput}
                  placeholder="设置密码"
                  placeholderTextColor={COLORS.textTertiary}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  autoFocus
                />
              ) : (
                <TouchableOpacity onPress={() => setShowPassword(true)}>
                  <Text style={styles.optionValue}>
                    {password ? '已设置' : '未设置'}
                  </Text>
                </TouchableOpacity>
              )}
              {password ? (
                <TouchableOpacity
                  onPress={() => {
                    setPassword('');
                    setShowPassword(false);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={20} color={COLORS.error} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons
            name={submitLabel.includes('添加') ? 'add-circle' : 'checkmark-circle'}
            size={22}
            color={COLORS.textInverse}
          />
          <Text style={styles.submitText}>{submitLabel}</Text>
        </TouchableOpacity>

        <View style={{ height: SPACING.xxxl * 2 }} />
      </ScrollView>

      <BrowserPicker
        visible={showBrowserPicker}
        selected={browserPackage}
        onSelect={handleBrowserSelect}
        onClose={() => setShowBrowserPicker(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  iconTypeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  iconTypeChip: {
    flex: 1,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTypeChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  iconTypeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  iconTypeTextActive: {
    color: COLORS.primary,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  emojiItem: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  emojiItemActive: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  emojiText: {
    fontSize: 24,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIconText: {
    backgroundColor: COLORS.primary,
  },
  previewText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  previewLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  optionLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  optionValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  passwordInput: {
    height: 36,
    width: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  submitButton: {
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  submitText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});
