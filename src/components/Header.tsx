import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
}

export function Header({ title, showBack, onBack, rightAction }: HeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.actionButton}>
            <Ionicons name={rightAction.icon} size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  left: { width: 44, alignItems: 'flex-start' },
  right: { width: 44, alignItems: 'flex-end' },
  backButton: { padding: SPACING.xs, marginLeft: -SPACING.xs },
  actionButton: { padding: SPACING.xs, marginRight: -SPACING.xs },
  title: {
    flex: 1,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
});
