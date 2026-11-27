import React, { type ReactElement, type ReactNode, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  type DimensionValue,
  type RefreshControlProps,
} from "react-native";
import { useNavigation, useNavigationState, useRoute } from "@react-navigation/native";
import { HeaderHeightContext } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "../hooks/useThemeColors";
import { ScreenBackButton } from "./ScreenBackButton";
import { ScreenMenuButton } from "./ScreenMenuButton";
import { useOptionalEventDrawer } from "../src/navigation/EventDrawerContext";

interface ScreenLayoutProps {
  title?: string;
  subtitle?: string;
  /** Force show/hide back chevron. Default: this focused screen can go back in-stack. */
  showBack?: boolean;
  /**
   * Show the event drawer hamburger. Defaults to true on tab roots
   * inside the event shell.
   */
  showMenu?: boolean;
  maxW?: string | number;
  refreshControl?: ReactElement<RefreshControlProps>;
  children: ReactNode;
}

export function ScreenLayout({
  title,
  subtitle,
  showBack,
  showMenu,
  maxW = "960",
  refreshControl,
  children,
}: ScreenLayoutProps) {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  const drawer = useOptionalEventDrawer();
  const { bg, text, muted } = useThemeColors();

  const maxWidth: DimensionValue =
    typeof maxW === "number"
      ? maxW
      : maxW.endsWith("%")
        ? (maxW as DimensionValue)
        : Number(maxW) || 960;

  const inEventShell = drawer != null;
  // Main + tab stacks are headerless; only trust a native header when one
  // is actually present. Prefer safe-area padding so content clears the status bar.
  const nativeHeaderVisible = !inEventShell && headerHeight > 0;

  // Reactive + focus-aware: only the focused stack screen shows back, so a
  // covered Overview doesn't freeze with a chevron after a push.
  const stackCanGoBack = useNavigationState((state) => {
    if (!state) return false;
    const index = state.index ?? 0;
    if (index <= 0) return false;
    const focused = state.routes[index];
    return focused?.key === route.key;
  });

  const showBackButton =
    showBack ?? (!nativeHeaderVisible && stackCanGoBack);
  const showMenuButton =
    showMenu ?? (inEventShell && !showBackButton);

  const topPad = (nativeHeaderVisible ? 0 : insets.top) + 16;

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[styles.content, { paddingTop: topPad }]}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.inner, { maxWidth }]}>
          {showBackButton || showMenuButton || title ? (
            <View style={styles.header}>
              {showBackButton ? (
                <ScreenBackButton />
              ) : showMenuButton ? (
                <ScreenMenuButton />
              ) : null}
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
    alignItems: "center",
    gap: 4,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
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
