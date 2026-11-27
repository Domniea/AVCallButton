import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTokenColor } from "./ui/gluestack";

type BasePillVariant =
  | "default"
  | "outline"
  | "primary"
  | "success"
  | "warning"
  | "danger";

/** @deprecated Use "primary" instead */
type LegacyVariant = "blue";

export interface BasePillProps {
  label: string;
  variant?: BasePillVariant | LegacyVariant;
}

const pillVariants: Record<
  BasePillVariant,
  { bg: [string, string]; fg: [string, string]; border?: boolean }
> = {
  default: {
    bg: ["bgMuted", "bgMutedDark"],
    fg: ["text", "textDark"],
  },
  outline: {
    bg: ["transparent", "transparent"],
    fg: ["text", "textDark"],
    border: true,
  },
  primary: {
    bg: ["primary.100", "primary.900"],
    fg: ["primary.700", "primary.200"],
  },
  // Status hues aren't in brand tokens — pin readable solids.
  success: {
    bg: ["#DCFCE7", "#14532D"],
    fg: ["#15803D", "#BBF7D0"],
  },
  warning: {
    bg: ["#FFEDD5", "#7C2D12"],
    fg: ["#C2410C", "#FED7AA"],
  },
  danger: {
    bg: ["#FEE2E2", "#7F1D1D"],
    fg: ["#DC2626", "#FCA5A5"],
  },
};

export function BasePill({ label, variant = "default" }: BasePillProps) {
  const resolvedVariant = variant === "blue" ? "primary" : variant;
  const tokens = pillVariants[resolvedVariant];
  const outlineBorder = useTokenColor("cardBorder", "cardBorderDark");
  const bg = useTokenColor(tokens.bg[0], tokens.bg[1]);
  const fg = useTokenColor(tokens.fg[0], tokens.fg[1]);

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: bg,
          borderWidth: tokens.border ? 1 : 0,
          borderColor: outlineBorder,
        },
      ]}
    >
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
