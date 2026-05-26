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
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { DEFAULT_ICONS, ICON_OPTIONS } from '../constants/browsers';
import { BrowserPicker } from './BrowserPicker';
import { useTheme } from '../contexts/ThemeContext';
import { useLinks } from '../contexts/LinkContext';
import { QuickLink, BrowserInfo } from '../types';

interface LinkFormProps {
  initialValues?: Partial<QuickLink>;
  onSubmit: (data: Omit<QuickLink, 'id' | 'createdAt' | 'updatedAt'>) => void;
  submitLabel: string;
}

export function LinkForm({ initialValues, onSubmit, submitLabel }: LinkFormProps) {
  const { colors } = useTheme();
  const { getCategories } = useLinks();

  const [name, setName] = useState(initialValues?.name || '');
  const [url, setUrl] = useState(initialValues?.url || '');
  const [icon, setIcon] = useState(initialValues?.icon || DEFAULT_ICONS[0]);
  const [iconType, setIconType] = useState<'emoji' | 'icon' | 'text'>(
    initialValues?.iconType || 'emoji',
  );
  const [browserPackage, setBrowserPackage] = useState(initialValues?.browserPackage);
  const [browserName, setBrowserName] = useState('');
  const [password, setPassword] = useState(initialValues?.password || '');
  const [category, setCategory] = useState(initialValues?.category || '');
  const [showBrowserPicker, setShowBrowserPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  const existingCategories = getCategories();

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
      category: category.trim() || undefined,
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

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={s.container} keyboardShouldPersistTaps="handled">

        {/* 图标选择 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>图标</Text>
          <View style={s.iconTypeRow}>
            {ICON_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.type}
                style={[s.iconTypeChip, iconType === opt.type && s.iconTypeChipActive]}
                onPress={() => {
                  setIconType(opt.type);
                  if (opt.type === 'emoji') setIcon(DEFAULT_ICONS[0]);
                  else if (opt.type === 'icon') setIcon('link');
                  else setIcon('');
                }}
              >
                <Text
                  style={[
                    s.iconTypeText,
                    iconType === opt.type && s.iconTypeTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {iconType === 'emoji' && (
            <View style={s.emojiGrid}>
              {DEFAULT_ICONS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={[s.emojiItem, icon === emoji && s.emojiItemActive]}
                  onPress={() => setIcon(emoji)}
                >
                  <Text style={s.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {iconType === 'icon' && (
            <View style={s.previewContainer}>
              <View style={s.previewIcon}>
                <Ionicons
                  name={(icon as keyof typeof Ionicons.glyphMap) || 'link'}
                  size={32}
                  color={colors.primary}
                />
              </View>
              <Text style={s.previewLabel}>图标: {icon || 'link'}</Text>
            </View>
          )}

          {iconType === 'text' && (
            <View style={s.previewContainer}>
              <View style={[s.previewIcon, s.previewIconText]}>
                <Text style={s.previewText}>
                  {name ? name.charAt(0).toUpperCase() : 'A'}
                </Text>
              </View>
              <Text style={s.previewLabel}>将取名称首字符作为图标</Text>
            </View>
          )}
        </View>

        {/* 基本信息 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>基本信息</Text>

          <Text style={s.label}>链接名称</Text>
          <TextInput
            style={[s.input, errors.name ? s.inputError : null]}
            placeholder="例如：我的博客"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={text => {
              setName(text);
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
            }}
            maxLength={20}
          />
          {errors.name ? <Text style={s.errorText}>{errors.name}</Text> : null}

          <Text style={s.label}>链接地址 (URL)</Text>
          <TextInput
            style={[s.input, errors.url ? s.inputError : null]}
            placeholder="例如：https://example.com"
            placeholderTextColor={colors.textTertiary}
            value={url}
            onChangeText={text => {
              setUrl(text);
              if (errors.url) setErrors(prev => ({ ...prev, url: undefined }));
            }}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.url ? <Text style={s.errorText}>{errors.url}</Text> : null}

          <Text style={s.label}>分类（可选）</Text>
          <TextInput
            style={s.input}
            placeholder="例如：工作、娱乐、学习"
            placeholderTextColor={colors.textTertiary}
            value={category}
            onChangeText={setCategory}
            maxLength={20}
          />
          {/* 已有分类快速选择 */}
          {existingCategories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.categorySuggestions}
              contentContainerStyle={s.categorySuggestionsContent}
            >
              {existingCategories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[s.categorySuggestion, category === cat && s.categorySuggestionActive]}
                  onPress={() => setCategory(category === cat ? '' : cat)}
                >
                  <Text
                    style={[
                      s.categorySuggestionText,
                      category === cat && s.categorySuggestionTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 浏览器设置 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>浏览器设置</Text>
          <TouchableOpacity
            style={s.optionRow}
            onPress={() => setShowBrowserPicker(true)}
          >
            <View style={s.optionLeft}>
              <Ionicons name="compass" size={22} color={colors.primary} />
              <Text style={s.optionLabel}>
                {browserName || '选择浏览器'}
              </Text>
            </View>
            <View style={s.optionRight}>
              {browserName ? (
                <View style={s.flexRow}>
                  <Text style={s.optionValue}>{browserName}</Text>
                  <TouchableOpacity
                    onPress={() => { setBrowserPackage(undefined); setBrowserName(''); }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={s.optionValue}>系统默认</Text>
              )}
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 安全设置 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>安全设置</Text>
          <View style={s.optionRow}>
            <View style={s.optionLeft}>
              <Ionicons name="lock-closed" size={22} color={colors.warning} />
              <Text style={s.optionLabel}>访问密码</Text>
            </View>
            <View style={s.optionRight}>
              {showPassword ? (
                <TextInput
                  style={s.passwordInput}
                  placeholder="设置密码"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  autoFocus
                />
              ) : (
                <TouchableOpacity onPress={() => setShowPassword(true)}>
                  <Text style={s.optionValue}>{password ? '已设置' : '未设置'}</Text>
                </TouchableOpacity>
              )}
              {password ? (
                <TouchableOpacity
                  onPress={() => { setPassword(''); setShowPassword(false); }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.submitButton} onPress={handleSubmit}>
          <Ionicons
            name={submitLabel.includes('添加') || submitLabel.includes('创建') ? 'add-circle' : 'checkmark-circle'}
            size={22}
            color={colors.textInverse}
          />
          <Text style={s.submitText}>{submitLabel}</Text>
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

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, backgroundColor: colors.background, padding: SPACING.lg },
    section: {
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,
      ...SHADOWS.sm,
    },
    sectionTitle: {
      fontSize: FONT_SIZE.md,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: SPACING.md,
    },
    label: {
      fontSize: FONT_SIZE.sm,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: SPACING.xs,
      marginTop: SPACING.md,
    },
    input: {
      height: 48,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      fontSize: FONT_SIZE.md,
      color: colors.textPrimary,
      backgroundColor: colors.background,
    },
    inputError: { borderColor: colors.error },
    errorText: { fontSize: FONT_SIZE.xs, color: colors.error, marginTop: SPACING.xs },
    categorySuggestions: { marginTop: SPACING.sm, maxHeight: 36 },
    categorySuggestionsContent: { gap: SPACING.sm },
    categorySuggestion: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    categorySuggestionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    categorySuggestionText: {
      fontSize: FONT_SIZE.sm,
      color: colors.textSecondary,
    },
    categorySuggestionTextActive: { color: colors.primary },
    iconTypeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
    iconTypeChip: {
      flex: 1,
      height: 36,
      borderRadius: BORDER_RADIUS.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconTypeChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    iconTypeText: { fontSize: FONT_SIZE.sm, fontWeight: '500', color: colors.textSecondary },
    iconTypeTextActive: { color: colors.primary },
    emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
    emojiItem: {
      width: 44,
      height: 44,
      borderRadius: BORDER_RADIUS.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    emojiItemActive: {
      backgroundColor: colors.primaryLight,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    emojiText: { fontSize: 24 },
    previewContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      padding: SPACING.md,
      backgroundColor: colors.background,
      borderRadius: BORDER_RADIUS.md,
    },
    previewIcon: {
      width: 52,
      height: 52,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewIconText: { backgroundColor: colors.primary },
    previewText: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: colors.textInverse },
    previewLabel: { fontSize: FONT_SIZE.sm, color: colors.textSecondary },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SPACING.md,
    },
    optionLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
    optionLabel: { fontSize: FONT_SIZE.md, color: colors.textPrimary },
    optionRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    optionValue: { fontSize: FONT_SIZE.sm, color: colors.textSecondary },
    flexRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    passwordInput: {
      height: 36,
      width: 100,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BORDER_RADIUS.sm,
      paddingHorizontal: SPACING.sm,
      fontSize: FONT_SIZE.sm,
      color: colors.textPrimary,
    },
    submitButton: {
      height: 52,
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      ...SHADOWS.md,
    },
    submitText: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: colors.textInverse },
  });
}
