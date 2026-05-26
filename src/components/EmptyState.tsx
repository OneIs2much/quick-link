import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

export function EmptyState({ icon = 'link-outline', title, description }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={64} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxxl,
    paddingBottom: SPACING.xxxl * 2,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 22,
  },
});
