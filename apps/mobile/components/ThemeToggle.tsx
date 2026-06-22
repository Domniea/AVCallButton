import React from "react";
import { HStack, Text, Switch, useColorMode } from "native-base";
import { BaseCard } from "./BaseCard";
import { useThemeColors } from "../hooks/useThemeColors";

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { text } = useThemeColors();

  return (
    <HStack alignItems="center" justifyContent="space-between" pt={4}>
      <Text fontSize="sm" color={text}>
        {colorMode === "light" ? "Light mode" : "Dark mode"}
      </Text>
      <BaseCard variant="elevated" p={3}>
        <Switch isChecked={colorMode === "dark"} onToggle={toggleColorMode} />
      </BaseCard>
    </HStack>
  );
}
