import React, { type ReactElement, type ReactNode, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  type DimensionValue,
  type RefreshControlProps,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { HeaderHeightContext } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "../hooks/useThemeColors";
import { ScreenBackButton } from "./ScreenBackButton";

interface ScreenLayoutProps {
  title?: string;
  subtitle?: string;
  /** Force show/hide back chevron. Default: navigation.canGoBack(). */
  showBack?: boolean;
  maxW?: string | number;
  refreshControl?: ReactElement<RefreshControlProps>;
  children: ReactNode;
}

export function ScreenLayout({
  title,
  subtitle,
  showBack,
  maxW = "960",
  refreshControl,
  children,
}: ScreenLayoutProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  const { bg, text, muted } = useThemeColors();

  const maxWidth: DimensionValue =
    typeof maxW === "number"
      ? maxW
      : maxW.endsWith("%")
        ? (maxW as DimensionValue)
        : Number(maxW) || 960;

  // Avoid a second back control when the native stack header is visible.
  const showBackButton =
    showBack ?? (headerHeight === 0 && navigation.canGoBack());
  // Native header already clears the status bar; headerless stacks need inset.
  const topPad = (headerHeight > 0 ? 0 : insets.top) + 16;

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[styles.content, { paddingTop: topPad }]}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.inner, { maxWidth }]}>
          {showBackButton || title ? (
            <View style={styles.header}>
              {showBackButton ? <ScreenBackButton /> : null}
              {title ? (
                <View style={styles.titleBlock}>
                  <Text style={[styles.title, { color: text }]}>{title}</Text>
                  {subtitle ? (
                    <Text style={[styles.subtitle, { color: muted }]}>
                      {subtitle}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : subtitle ? (
            <Text style={[styles.subtitle, { color: muted }]}>{subtitle}</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  inner: {
    width: "100%",
    alignSelf: "center",
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
  },
});
