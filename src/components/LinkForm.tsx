import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { BrowserPicker } from './BrowserPicker';
import { useTheme } from '../contexts/ThemeContext';
import { useLinks } from '../contexts/LinkContext';
import { QuickLink, BrowserInfo } from '../types';
import { getFaviconUrl } from '../services/faviconService';
import { fetchPageTitle } from '../services/pageTitleService';

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
  const [icon, setIcon] = useState(initialValues?.icon || '');
  const [iconType, setIconType] = useState<'favicon' | 'custom'>(
    // 旧数据 iconType 为 emoji/icon/text 时，降级为 favicon
    (initialValues?.iconType === 'favicon' || initialValues?.iconType === 'custom')
      ? initialValues.iconType
      : 'favicon',
  );
  const [browserPackage, setBrowserPackage] = useState(initialValues?.browserPackage);
  const [browserName, setBrowserName] = useState('');
  const [password, setPassword] = useState(initialValues?.password || '');
  const [category, setCategory] = useState(initialValues?.category || '');
  const [showBrowserPicker, setShowBrowserPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});
  const [suggestedName, setSuggestedName] = useState<string | undefined>();
  const [fetchingTitle, setFetchingTitle] = useState(false);

  const existingCategories = getCategories();

  // URL 变化时自动更新 favicon（仅 favicon 模式）
  useEffect(() => {
    if (iconType !== 'favicon') return;
    const faviconUrl = getFaviconUrl(url);
    setIcon(faviconUrl || '');
  }, [url, iconType]);

  const handleIconTypeChange = (type: 'favicon' | 'custom') => {
    setIconType(type);
    if (type === 'favicon') {
      setIcon(getFaviconUrl(url) || '');
    } else {
      // 切换到自定义时清空，等用户选图
      setIcon('');
    }
  };

  const handleUrlBlur = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setFetchingTitle(true);
    const title = await fetchPageTitle(trimmed);
    setFetchingTitle(false);
    if (!title) return;
    const capped = title.slice(0, 20);
    if (!name.trim()) {
      setName(capped);
    } else {
      setSuggestedName(capped);
    }
  };

  const handlePickImage = async () => {    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
    });
    if (!result.canceled && result.assets[0]) {
      setIcon(result.assets[0].uri);
    }
  };

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

          {/* 模式切换 */}
          <View style={s.iconTypeRow}>
            {([
              { type: 'favicon', label: '自动抓取' },
              { type: 'custom', label: '自定义图片' },
            ] as const).map(opt => (
              <TouchableOpacity
                key={opt.type}
                style={[s.iconTypeChip, iconType === opt.type && s.iconTypeChipActive]}
                onPress={() => handleIconTypeChange(opt.type)}
              >
                <Text style={[s.iconTypeText, iconType === opt.type && s.iconTypeTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 预览 + 操作 */}
          <View style={s.iconPreviewRow}>
            <View style={[s.iconPreviewBox, { backgroundColor: colors.primaryLight }]}>
              {icon ? (
                <Image source={{ uri: icon }} style={s.iconPreviewImage} />
              ) : (
                <Ionicons name="link" size={32} color={colors.primary} />
              )}
            </View>

            <View style={s.iconPreviewInfo}>
              {iconType === 'favicon' ? (
                <Text style={[s.iconHint, { color: colors.textSecondary }]}>
                  {icon ? '已自动抓取站点图标' : '填写链接地址后自动获取'}
                </Text>
              ) : (
                <TouchableOpacity style={[s.pickButton, { backgroundColor: colors.primary }]} onPress={handlePickImage}>
                  <Ionicons name="image-outline" size={18} color={colors.textInverse} />
                  <Text style={[s.pickButtonText, { color: colors.textInverse }]}>
                    {icon ? '重新选择' : '选择图片'}
                  </Text>
                </TouchableOpacity>
              )}
              <Text style={[s.iconHintSub, { color: colors.textTertiary }]}>
                {iconType === 'favicon'
                  ? '无法获取时显示默认图标'
                  : '将自动裁剪为 1:1 正方形'}
              </Text>
            </View>
          </View>
        </View>

        {/* 基本信息 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>基本信息</Text>

          <View style={s.labelRow}>
            <Text style={[s.label, s.labelInRow]}>链接地址 (URL)</Text>
            <Text style={[s.required, { color: colors.error }]}>*</Text>
          </View>
          <View style={s.urlRow}>
            <TextInput
              style={[s.input, s.urlInput, errors.url ? s.inputError : null]}
              placeholder="例如：https://example.com"
              placeholderTextColor={colors.textTertiary}
              value={url}
              onChangeText={text => {
                setUrl(text);
                setSuggestedName(undefined);
                if (errors.url) setErrors(prev => ({ ...prev, url: undefined }));
              }}
              onBlur={handleUrlBlur}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {fetchingTitle ? (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={s.urlLoader}
              />
            ) : null}
          </View>
          {errors.url ? <Text style={s.errorText}>{errors.url}</Text> : null}

          <View style={s.labelRow}>
            <Text style={[s.label, s.labelInRow]}>链接名称</Text>
            <Text style={[s.required, { color: colors.error }]}>*</Text>
          </View>
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
          {suggestedName ? (
            <View style={[s.suggestionBar, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
              <Text style={[s.suggestionText, { color: colors.textSecondary }]} numberOfLines={1}>
                建议名称：{suggestedName}
              </Text>
              <TouchableOpacity
                onPress={() => { setName(suggestedName); setSuggestedName(undefined); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[s.suggestionUse, { color: colors.primary }]}>使用</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSuggestedName(undefined)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={14} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          ) : null}
          {errors.name ? <Text style={s.errorText}>{errors.name}</Text> : null}

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
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      marginBottom: SPACING.xs,
      marginTop: SPACING.md,
    },
    labelInRow: {
      marginBottom: 0,
      marginTop: 0,
    },
    required: {
      fontSize: FONT_SIZE.sm,
      fontWeight: '700',
      lineHeight: 18,
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
    iconPreviewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      padding: SPACING.md,
      backgroundColor: colors.background,
      borderRadius: BORDER_RADIUS.md,
    },
    iconPreviewBox: {
      width: 64,
      height: 64,
      borderRadius: BORDER_RADIUS.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    iconPreviewImage: {
      width: 40,
      height: 40,
      borderRadius: BORDER_RADIUS.sm,
    },
    iconPreviewInfo: {
      flex: 1,
      gap: SPACING.xs,
    },
    iconHint: { fontSize: FONT_SIZE.sm },
    iconHintSub: { fontSize: FONT_SIZE.xs },
    pickButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.md,
      alignSelf: 'flex-start',
    },
    pickButtonText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
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
    urlRow: { flexDirection: 'row', alignItems: 'center' },
    urlInput: { flex: 1 },
    urlLoader: { marginLeft: SPACING.sm },
    suggestionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginTop: SPACING.xs,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.sm,
      borderWidth: 1,
    },
    suggestionText: { flex: 1, fontSize: FONT_SIZE.xs },
    suggestionUse: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  });
}
