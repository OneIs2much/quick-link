import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  SHADOWS,
} from "../constants/theme";
import { BROWSERS } from "../constants/browsers";
import { BrowserInfo } from "../types";

interface BrowserPickerProps {
  visible: boolean;
  selected?: string;
  onSelect: (browser?: BrowserInfo) => void;
  onClose: () => void;
}

export function BrowserPicker({
  visible,
  selected,
  onSelect,
  onClose,
}: BrowserPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>选择浏览器</Text>

          <TouchableOpacity
            style={[
              styles.browserItem,
              !selected && styles.browserItemSelected,
            ]}
            onPress={() => onSelect(undefined)}
          >
            <View style={styles.browserIcon}>
              <Ionicons
                name="phone-portrait-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.browserInfo}>
              <Text style={styles.browserName}>系统默认浏览器</Text>
              <Text style={styles.browserHint}>使用系统内置浏览器打开链接</Text>
            </View>
            {!selected && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>

          <FlatList
            data={BROWSERS}
            keyExtractor={(item) => item.packageName}
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.browserItem,
                  selected === item.packageName && styles.browserItemSelected,
                ]}
                onPress={() => onSelect(item)}
              >
                <View style={styles.browserIcon}>
                  <Ionicons
                    name={
                      (item.icon as keyof typeof Ionicons.glyphMap) || "globe"
                    }
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.browserInfo}>
                  <Text style={styles.browserName}>{item.name}</Text>
                  <Text style={styles.browserHint}>{item.packageName}</Text>
                </View>
                {selected === item.packageName && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>关闭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    maxHeight: "70%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  list: {
    maxHeight: 300,
  },
  browserItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  browserItemSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  browserIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  browserInfo: {
    flex: 1,
  },
  browserName: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  browserHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  closeButton: {
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.lg,
  },
  closeText: {
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});
