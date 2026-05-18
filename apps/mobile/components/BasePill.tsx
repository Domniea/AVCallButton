import React from "react";
import { Box, Text, useColorModeValue } from "native-base";

type BasePillVariant = "default" | "outline" | "blue";

export interface BasePillProps {
  label: string;
  variant?: BasePillVariant;
}

export function BasePill({ label, variant = "default" }: BasePillProps) {
  const defaultBg = useColorModeValue("muted", "mutedDark");
  const outlineBorder = useColorModeValue("cardBorder", "cardBorderDark");
  const blueBg = useColorModeValue("blue.100", "blue.900");
  const fg = useColorModeValue("text", "textDark");

  const bg =
    variant === "blue" ? blueBg : variant === "outline" ? "transparent" : defaultBg;
  const borderWidth = variant === "outline" ? 1 : 0;
  const borderColor = outlineBorder;

  return (
    <Box
      bg={bg}
      borderWidth={borderWidth}
      borderColor={borderColor}
      borderRadius="md"
      px={2}
      py={0.5}
    >
      <Text fontSize="xs" color={fg} textTransform="capitalize">
        {label}
      </Text>
    </Box>
  );
}
