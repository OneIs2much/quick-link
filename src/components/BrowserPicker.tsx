import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { BROWSERS } from '../constants/browsers';
import { BrowserInfo } from '../types';

interface BrowserPickerProps {
  visible: boolean;
  selected?: string;
  onSelect: (browser?: BrowserInfo) => void;
  onClose: () => void;
}

export function BrowserPicker({ visible, selected, onSelect, onClose }: BrowserPickerProps) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>选择浏览器</Text>

          <TouchableOpacity
            style={[styles.browserItem, !selected && { backgroundColor: colors.primaryLight }]}
            onPress={() => onSelect(undefined)}
          >
            <View style={[styles.browserIcon, { backgroundColor: colors.background }]}>
              <Ionicons name="phone-portrait-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.browserInfo}>
              <Text style={[styles.browserName, { color: colors.textPrimary }]}>
                系统默认浏览器
              </Text>
              <Text style={[styles.browserHint, { color: colors.textTertiary }]}>
                使用系统内置浏览器打开链接
              </Text>
            </View>
            {!selected && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          <FlatList
            data={BROWSERS}
            keyExtractor={item => item.packageName}
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.browserItem,
                  selected === item.packageName && { backgroundColor: colors.primaryLight },
                ]}
                onPress={() => onSelect(item)}
              >
                <View style={[styles.browserIcon, { backgroundColor: colors.background }]}>
                  <Ionicons
                    name={(item.icon as keyof typeof Ionicons.glyphMap) || 'globe'}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.browserInfo}>
                  <Text style={[styles.browserName, { color: colors.textPrimary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.browserHint, { color: colors.textTertiary }]}>
                    {item.packageName}
                  </Text>
                </View>
                {selected === item.packageName && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.background }]}
            onPress={onClose}
          >
            <Text style={[styles.closeText, { color: colors.textSecondary }]}>关闭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  list: { maxHeight: 300 },
  browserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  browserIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  browserInfo: { flex: 1 },
  browserName: { fontSize: FONT_SIZE.md, fontWeight: '600' },
  browserHint: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  closeButton: {
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  closeText: { fontSize: FONT_SIZE.md, fontWeight: '600' },
});
