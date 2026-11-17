import React, { type ReactNode } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../hooks/useThemeColors";
import { nativeTheme } from "@av/ui";

interface ListRowProps {
  title: string;
  subtitle?: string;
  meta?: string;
  accentColor?: string;
  onPress?: () => void;
  rightElement?: ReactNode;
  children?: ReactNode;
}

export function ListRow({
  title,
  subtitle,
  meta,
  accentColor,
  onPress,
  rightElement,
  children,
}: ListRowProps) {
  const { surface, text, muted, border } = useThemeColors();
  const subtle = nativeTheme.shadows.subtle;

  const content = (
    <View
      style={[
        styles.row,
        subtle,
        {
          backgroundColor: surface,
          borderColor: border,
        },
      ]}
    >
      {accentColor ? (
        <View style={[styles.accent, { backgroundColor: accentColor }]} />
      ) : null}

      <View
        style={[
          styles.inner,
          { paddingLeft: accentColor ? 20 : 16 },
        ]}
      >
        <View style={styles.body}>
          <Text style={[styles.title, { color: text }]} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: muted }]} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
          {meta ? (
            <Text style={[styles.meta, { color: muted }]}>{meta}</Text>
          ) : null}
          {children}
        </View>

        {rightElement ??
          (onPress ? (
            <Ionicons name="chevron-forward" size={16} color={muted} />
          ) : null)}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  accent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingRight: 16,
    gap: 12,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    marginTop: 4,
  },
});
