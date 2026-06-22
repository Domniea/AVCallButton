import React from "react";
import { Box, Text, useColorModeValue } from "native-base";

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
  success: {
    bg: ["green.100", "green.900"],
    fg: ["green.700", "green.200"],
  },
  warning: {
    bg: ["orange.100", "orange.900"],
    fg: ["orange.700", "orange.200"],
  },
  danger: {
    bg: ["red.100", "red.900"],
    fg: ["red.700", "red.200"],
  },
};

export function BasePill({ label, variant = "default" }: BasePillProps) {
  const resolvedVariant = variant === "blue" ? "primary" : variant;
  const tokens = pillVariants[resolvedVariant];
  const outlineBorder = useColorModeValue("cardBorder", "cardBorderDark");

  const bg = useColorModeValue(tokens.bg[0], tokens.bg[1]);
  const fg = useColorModeValue(tokens.fg[0], tokens.fg[1]);

  return (
    <Box
      bg={bg}
      borderWidth={tokens.border ? 1 : 0}
      borderColor={outlineBorder}
      borderRadius="full"
      px={2.5}
      py={0.5}
    >
      <Text
        fontSize="2xs"
        fontWeight="semibold"
        color={fg}
        textTransform="capitalize"
      >
        {label}
      </Text>
    </Box>
  );
}
