import React from "react";
import { View, ViewProps } from "react-native";
import {
  useGluestackColors as useGluestackColorsHook,
  useCalendarTheme as useCalendarThemeHook,
} from "./useGluestackColors";

export type ModeType = "light" | "dark" | "system";

export const useGluestackColors = useGluestackColorsHook;
export const useCalendarTheme = useCalendarThemeHook;
export type { GluestackColors } from "./useGluestackColors";

/** Thin root wrapper — no NativeWind (keeps LogBox readable). */
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
      {children}
    </View>
  );
}
