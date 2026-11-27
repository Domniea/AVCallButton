import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useThemeColors } from "../hooks/useThemeColors";
import { useOptionalEventDrawer } from "../src/navigation/EventDrawerContext";

type ScreenMenuButtonProps = {
  accessibilityLabel?: string;
};

/** Opens the event drawer when rendered inside the event shell. */
export function ScreenMenuButton({
  accessibilityLabel = "Open menu",
}: ScreenMenuButtonProps) {
  const drawer = useOptionalEventDrawer();
  const { text } = useThemeColors();

  if (!drawer) return null;

  return (
    <Pressable
      onPress={drawer.openDrawer}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
    >
      <Ionicons name="menu-outline" size={28} color={text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.55,
  },
});
