import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading…" }: LoadingScreenProps) {
  const { bg, muted, primary } = useThemeColors();

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <ActivityIndicator color={primary} size="large" />
      <Text style={[styles.message, { color: muted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
  },
});
