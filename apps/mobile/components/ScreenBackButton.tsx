import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useThemeColors } from "../hooks/useThemeColors";

type ScreenBackButtonProps = {
  onPress?: () => void;
  accessibilityLabel?: string;
};

/** Top-left chevron for headerless nested screens. */
export function ScreenBackButton({
  onPress,
  accessibilityLabel = "Go back",
}: ScreenBackButtonProps) {
  const navigation = useNavigation();
  const { text } = useThemeColors();

  return (
    <Pressable
      onPress={onPress ?? (() => navigation.goBack())}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
    >
      <Ionicons name="chevron-back" size={28} color={text} />
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
