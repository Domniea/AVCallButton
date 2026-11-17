"use client";
import React from "react";
import { View, type ViewProps } from "react-native";
import { OverlayProvider } from "@gluestack-ui/core/overlay/creator";
import { ToastProvider } from "@gluestack-ui/core/toast/creator";

export type ModeType = "light" | "dark" | "system";

/** Web provider — Overlay/Toast only; no NativeWind style flush. */
export function GluestackUIProvider({
  children,
  style,
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps["style"];
}) {
  return (
    <View style={[{ flex: 1, height: "100%", width: "100%" }, style]}>
      <OverlayProvider>
        <ToastProvider>{children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
