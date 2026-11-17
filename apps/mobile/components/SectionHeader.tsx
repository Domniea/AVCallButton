import React from "react";
import { Text, StyleSheet } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";

interface SectionHeaderProps {
  children: string;
}

export function SectionHeader({ children }: SectionHeaderProps) {
  const { text } = useThemeColors();

  return <Text style={[styles.header, { color: text }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  header: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
});
