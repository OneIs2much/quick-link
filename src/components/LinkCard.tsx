import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/theme";
import { QuickLink } from "../types";
import { getInitials } from "../utils/validators";

interface LinkCardProps {
  link: QuickLink;
  onPress: (link: QuickLink) => void;
  onLongPress: (link: QuickLink) => void;
}

export function LinkCard({ link, onPress, onLongPress }: LinkCardProps) {
  const renderIcon = () => {
    if (link.iconType === "emoji") {
      return <Text style={styles.emojiIcon}>{link.icon}</Text>;
    }
    if (link.iconType === "icon") {
      return (
        <Ionicons
          name={(link.icon as keyof typeof Ionicons.glyphMap) || "link"}
          size={28}
          color={COLORS.primary}
        />
      );
    }
    return <Text style={styles.textIcon}>{getInitials(link.name)}</Text>;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(link)}
      onLongPress={() => onLongPress(link)}
      activeOpacity={0.7}
      delayLongPress={400}
    >
      <View style={styles.iconContainer}>
        {renderIcon()}
        {link.password ? (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={10} color={COLORS.textInverse} />
          </View>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
        {link.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "30%",
    aspectRatio: 0.85,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  emojiIcon: {
    fontSize: 30,
  },
  textIcon: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "700",
    color: COLORS.primary,
  },
  lockBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.warning,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  name: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "500",
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 18,
  },
});
