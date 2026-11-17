import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { BaseCard } from "./BaseCard";
import { useThemeColors } from "../hooks/useThemeColors";
import { useColorMode } from "../providers/ColorModeProvider";

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { text, border, primary } = useThemeColors();

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: text }]}>
        {colorMode === "light" ? "Light mode" : "Dark mode"}
      </Text>
      <BaseCard variant="elevated" style={styles.cardPad}>
        <Switch
          value={colorMode === "dark"}
          onValueChange={toggleColorMode}
          trackColor={{ false: border, true: primary }}
        />
      </BaseCard>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
  },
  label: {
    fontSize: 14,
  },
  cardPad: {
    padding: 12,
  },
});
