import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Header } from '../components/Header';
import { BrowserPicker } from '../components/BrowserPicker';
import { useSettings } from '../contexts/SettingsContext';
import { useLinks } from '../contexts/LinkContext';
import { clearAllData } from '../services/storage';
import { BrowserInfo } from '../types';

interface Props {
  navigation: any;
}

export function SettingsScreen({ navigation }: Props) {
  const { settings, setDefaultBrowser, updateSettings } = useSettings();
  const { links } = useLinks();
  const insets = useSafeAreaInsets();
  const [showBrowserPicker, setShowBrowserPicker] = useState(false);

  const [selectedBrowserName, setSelectedBrowserName] = useState(
    settings.defaultBrowser ? '' : ''
  );

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
    Alert.alert(
      '清除所有数据',
      '这将删除所有快捷链接和设置，此操作不可恢复。确定继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('已清除', '所有数据已被清除');
          },
        },
      ]
    );
  };

  const handleResetTutorial = async () => {
    await updateSettings({ tutorialCompleted: false });
    Alert.alert('已重置', '教程将在下次启动时重新显示');
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <Header
          title="设置"
          showBack
          onBack={() => navigation.goBack()}
        />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>默认浏览器</Text>
          <Text style={styles.sectionDescription}>
            选择打开链接时使用的默认浏览器，也可为每个链接单独设置
          </Text>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setShowBrowserPicker(true)}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="compass" size={22} color={COLORS.primary} />
              <Text style={styles.optionLabel}>
                {selectedBrowserName || '系统默认浏览器'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据统计</Text>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{links.length}</Text>
              <Text style={styles.statLabel}>快捷链接</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>其他</Text>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => navigation.navigate('Tutorial')}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="book-outline" size={22} color={COLORS.secondary} />
              <Text style={styles.optionLabel}>查看使用教程</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow} onPress={handleResetTutorial}>
            <View style={styles.optionLeft}>
              <Ionicons name="refresh-outline" size={22} color={COLORS.warning} />
              <Text style={styles.optionLabel}>重置使用教程</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.optionDivider} />

          <TouchableOpacity style={styles.optionRow} onPress={handleClearData}>
            <View style={styles.optionLeft}>
              <Ionicons name="trash-outline" size={22} color={COLORS.error} />
              <Text style={[styles.optionLabel, { color: COLORS.error }]}>
                清除所有数据
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Quick Link v1.0.0</Text>
          <Text style={styles.copyright}>Powered by Expo & React Native</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flex: 1,
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
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
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
    color: COLORS.textPrimary,
  },
  optionDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.xs,
  },
  statRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
  },
  statValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  version: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  copyright: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});
