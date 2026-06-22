import React from "react";
import { Text } from "native-base";
import { useThemeColors } from "../hooks/useThemeColors";

interface SectionHeaderProps {
  children: string;
}

export function SectionHeader({ children }: SectionHeaderProps) {
  const { text } = useThemeColors();

  return (
    <Text
      fontSize="sm"
      fontWeight="semibold"
      fontFamily="heading"
      color={text}
      mb={2}
    >
      {children}
    </Text>
  );
}
