import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Header } from '../components/Header';
import { BrowserPicker } from '../components/BrowserPicker';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLinks } from '../contexts/LinkContext';
import { useToast } from '../hooks/useToast';
import { clearAllData, exportData, importData } from '../services/storage';
import { BrowserInfo, ThemeMode } from '../types';
import { BROWSERS } from '../constants/browsers';

interface Props {
  navigation: any;
}

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'system', label: '跟随系统', icon: 'phone-portrait-outline' },
  { mode: 'light', label: '浅色', icon: 'sunny-outline' },
  { mode: 'dark', label: '深色', icon: 'moon-outline' },
];

export function SettingsScreen({ navigation }: Props) {
  const { settings, setDefaultBrowser, updateSettings, setThemeMode } = useSettings();
  const { colors, themeMode } = useTheme();
  const { links } = useLinks();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [showBrowserPicker, setShowBrowserPicker] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  // 修复：从 BROWSERS 列表查找已保存的浏览器名称，而非硬编码空字符串
  const [selectedBrowserName, setSelectedBrowserName] = useState(() => {
    if (!settings.defaultBrowser) return '';
    return BROWSERS.find(b => b.packageName === settings.defaultBrowser)?.name ?? '';
  });

  const handleBrowserSelect = (browser?: BrowserInfo) => {
    setShowBrowserPicker(false);
    if (browser) {
      setDefaultBrowser(browser.packageName);
      setSelectedBrowserName(browser.name);
    } else {
      setDefaultBrowser(undefined);
      setSelectedBrowserName('');
    }
  };

  const handleClearData = () => {
    toast.confirm(
      '清除所有数据',
      '这将删除所有快捷链接和设置，此操作不可恢复。确定继续吗？',
      async () => {
        try {
          await clearAllData();
          toast.success('所有数据已被清除');
        } catch {
          toast.error('清除数据失败，请重试');
        }
      },
      '清除',
      true,
    );
  };

  const handleResetTutorial = async () => {
    await updateSettings({ tutorialCompleted: false });
    toast.success('教程将在下次启动时重新显示');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const json = await exportData();
      const filename = `quick-link-backup-${Date.now()}.json`;
      const file = new File(Paths.cache, filename);
      file.write(json);
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: '导出 Quick Link 数据',
      });
    } catch {
      toast.error('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const file = new File(fileUri);
      const json = await file.text();
      await importData(json);
      toast.success('数据导入成功');
    } catch (e: any) {
      toast.error(e?.message || '导入失败，请检查文件格式');
    } finally {
      setImporting(false);
    }
  };

  const s = makeStyles(colors);

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: insets.top }}>
        <Header title="设置" showBack onBack={() => navigation.goBack()} />
      </View>

      <ScrollView style={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 默认浏览器 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>默认浏览器</Text>
          <Text style={s.sectionDescription}>
            选择打开链接时使用的默认浏览器，也可为每个链接单独设置
          </Text>
          <TouchableOpacity style={s.optionRow} onPress={() => setShowBrowserPicker(true)}>
            <View style={s.optionLeft}>
              <Ionicons name="compass" size={22} color={colors.primary} />
              <Text style={s.optionLabel}>
                {selectedBrowserName || '系统默认浏览器'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* 外观主题 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>外观</Text>
          <View style={s.themeRow}>
            {THEME_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.mode}
                style={[
                  s.themeChip,
                  themeMode === opt.mode && s.themeChipActive,
                ]}
                onPress={() => setThemeMode(opt.mode)}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={18}
                  color={themeMode === opt.mode ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    s.themeChipText,
                    themeMode === opt.mode && s.themeChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 数据统计 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>数据统计</Text>
          <View style={s.statRow}>
            <View style={[s.statItem, { backgroundColor: colors.primaryLight }]}>
              <Text style={[s.statValue, { color: colors.primary }]}>{links.length}</Text>
              <Text style={[s.statLabel, { color: colors.textSecondary }]}>快捷链接</Text>
            </View>
          </View>
        </View>

        {/* 数据管理 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>数据管理</Text>

          <TouchableOpacity style={s.optionRow} onPress={handleExport} disabled={exporting}>
            <View style={s.optionLeft}>
              <Ionicons name="share-outline" size={22} color={colors.secondary} />
              <Text style={s.optionLabel}>导出数据</Text>
            </View>
            {exporting
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            }
          </TouchableOpacity>

          <TouchableOpacity style={s.optionRow} onPress={handleImport} disabled={importing}>
            <View style={s.optionLeft}>
              <Ionicons name="download-outline" size={22} color={colors.secondary} />
              <Text style={s.optionLabel}>导入数据</Text>
            </View>
            {importing
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            }
          </TouchableOpacity>
        </View>

        {/* 其他 */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>其他</Text>

          <TouchableOpacity
            style={s.optionRow}
            onPress={() => navigation.navigate('Tutorial')}
          >
            <View style={s.optionLeft}>
              <Ionicons name="book-outline" size={22} color={colors.secondary} />
              <Text style={s.optionLabel}>查看使用教程</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={s.optionRow} onPress={handleResetTutorial}>
            <View style={s.optionLeft}>
              <Ionicons name="refresh-outline" size={22} color={colors.warning} />
              <Text style={s.optionLabel}>重置使用教程</Text>
            </View>
          </TouchableOpacity>

          <View style={s.optionDivider} />

          <TouchableOpacity style={s.optionRow} onPress={handleClearData}>
            <View style={s.optionLeft}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
              <Text style={[s.optionLabel, { color: colors.error }]}>清除所有数据</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <Text style={[s.version, { color: colors.textTertiary }]}>Quick Link v1.0.0</Text>
          <Text style={[s.copyright, { color: colors.textTertiary }]}>
            Powered by Expo & React Native
          </Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      <BrowserPicker
        visible={showBrowserPicker}
        selected={settings.defaultBrowser}
        onSelect={handleBrowserSelect}
        onClose={() => setShowBrowserPicker(false)}
      />
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flex: 1, padding: SPACING.lg },
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
      marginBottom: SPACING.xs,
    },
    sectionDescription: {
      fontSize: FONT_SIZE.sm,
      color: colors.textTertiary,
      marginBottom: SPACING.md,
      lineHeight: 20,
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
      color: colors.textPrimary,
    },
    optionDivider: {
      height: 1,
      backgroundColor: colors.divider,
      marginVertical: SPACING.xs,
    },
    themeRow: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginTop: SPACING.xs,
    },
    themeChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    themeChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLight,
    },
    themeChipText: {
      fontSize: FONT_SIZE.sm,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    themeChipTextActive: {
      color: colors.primary,
    },
    statRow: { flexDirection: 'row' },
    statItem: {
      flex: 1,
      alignItems: 'center',
      padding: SPACING.lg,
      borderRadius: BORDER_RADIUS.md,
    },
    statValue: {
      fontSize: FONT_SIZE.xxxl,
      fontWeight: '800',
    },
    statLabel: {
      fontSize: FONT_SIZE.sm,
      marginTop: SPACING.xs,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: SPACING.xl,
    },
    version: {
      fontSize: FONT_SIZE.sm,
      fontWeight: '500',
    },
    copyright: {
      fontSize: FONT_SIZE.xs,
      marginTop: SPACING.xs,
    },
  });
}
