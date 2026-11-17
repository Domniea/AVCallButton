import React, { type ReactNode } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { BaseCard } from "./BaseCard";
import { useThemeColors } from "../hooks/useThemeColors";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  const { bg, text, muted } = useThemeColors();

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <BaseCard
            variant="elevated"
            style={styles.card}
          >
            <View style={styles.stack}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: text }]}>{title}</Text>
                {subtitle ? (
                  <Text style={[styles.subtitle, { color: muted }]}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>

              {children}

              {footer}
            </View>
          </BaseCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 32,
  },
  card: {
    padding: 32,
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  stack: {
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
