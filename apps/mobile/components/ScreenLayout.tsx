import React, { type ReactElement, type ReactNode } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  type DimensionValue,
  type RefreshControlProps,
} from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";

interface ScreenLayoutProps {
  title?: string;
  subtitle?: string;
  maxW?: string | number;
  refreshControl?: ReactElement<RefreshControlProps>;
  children: ReactNode;
}

export function ScreenLayout({
  title,
  subtitle,
  maxW = "960",
  refreshControl,
  children,
}: ScreenLayoutProps) {
  const { bg, text, muted } = useThemeColors();
  const maxWidth: DimensionValue =
    typeof maxW === "number"
      ? maxW
      : maxW.endsWith("%")
        ? (maxW as DimensionValue)
        : Number(maxW) || 960;

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.inner, { maxWidth }]}>
          {title ? (
            <View style={styles.header}>
              <Text style={[styles.title, { color: text }]}>{title}</Text>
              {subtitle ? (
                <Text style={[styles.subtitle, { color: muted }]}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}

          {children}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  inner: {
    width: "100%",
    alignSelf: "center",
    gap: 24,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
  },
});
