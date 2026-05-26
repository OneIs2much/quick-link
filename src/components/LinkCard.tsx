import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { QuickLink } from '../types';
import { getInitials } from '../utils/validators';

interface LinkCardProps {
  link: QuickLink;
  onPress: (link: QuickLink) => void;
  onLongPress: (link: QuickLink) => void;
}

export function LinkCard({ link, onPress, onLongPress }: LinkCardProps) {
  const { colors } = useTheme();

  const renderIcon = () => {
    if (link.iconType === 'emoji') {
      return <Text style={styles.emojiIcon}>{link.icon}</Text>;
    }
    if (link.iconType === 'icon') {
      return (
        <Ionicons
          name={(link.icon as keyof typeof Ionicons.glyphMap) || 'link'}
          size={28}
          color={colors.primary}
        />
      );
    }
    return (
      <Text style={[styles.textIcon, { color: colors.primary }]}>
        {getInitials(link.name)}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={() => onPress(link)}
      onLongPress={() => onLongPress(link)}
      activeOpacity={0.7}
      delayLongPress={400}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        {renderIcon()}
        {link.password ? (
          <View style={[styles.lockBadge, { borderColor: colors.surface }]}>
            <Ionicons name="lock-closed" size={10} color={colors.textInverse} />
          </View>
        ) : null}
      </View>
      <Text
        style={[styles.name, { color: colors.textPrimary }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {link.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '30%',
    aspectRatio: 0.85,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  emojiIcon: { fontSize: 30 },
  textIcon: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
  lockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  name: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});
