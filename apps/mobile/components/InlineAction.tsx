import React from "react";
import { Text, Pressable, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTokenColor } from "./ui/gluestack";

type InlineActionVariant = "default" | "outline" | "danger";

interface InlineActionProps {
  title: string;
  onPress?: () => void;
  variant?: InlineActionVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export function InlineAction({
  title,
  onPress,
  variant = "default",
  icon,
  disabled,
}: InlineActionProps) {
  const defaultFg = useTokenColor("primary.600", "accent.600");
  const outlineBorder = useTokenColor("cardBorder", "cardBorderDark");
  const outlineFg = useTokenColor("text", "textDark");
  const dangerFg = useTokenColor("red.600", "red.300");
  const pressedBg = useTokenColor("primary.50", "primary.900");

  const fg =
    variant === "danger"
      ? dangerFg
      : variant === "outline"
        ? outlineFg
        : defaultFg;

  const iconName =
    icon ?? (variant === "default" ? ("add" as const) : undefined);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.pressable,
        {
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: outlineBorder,
          backgroundColor: pressed && !disabled ? pressedBg : "transparent",
        },
      ]}
    >
      <View style={styles.row}>
        {iconName ? (
          <Ionicons name={iconName} size={12} color={fg} />
        ) : null}
        <Text style={[styles.label, { color: fg }]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
});
