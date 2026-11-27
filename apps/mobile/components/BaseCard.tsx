import React from "react";
import {
  View,
  Text,
  StyleSheet,
  type ViewProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { nativeTheme } from "@av/ui";
import { useTokenColor } from "./ui/gluestack";
import {
  viewStyleFromProps,
  restNativeProps,
  type StylePropBag,
} from "./ui/layout/styleProps";
import { useColorMode } from "../providers/ColorModeProvider";

type TitleAlign = "start" | "center" | "end" | "left" | "right";

type BaseCardProps = StylePropBag &
  Omit<ViewProps, "children"> & {
    title?: string;
    titleAlign?: TitleAlign;
    variant?: "default" | "surface" | "elevated" | "outline";
    accentColor?: string;
    children?: React.ReactNode;
  };

const cardVariants = {
  default: {
    bg: ["cardBg", "cardBgDark"] as const,
    fg: ["text", "textDark"] as const,
    border: ["transparent", "transparent"] as const,
    borderWidth: 0,
    shadow: ["card", "cardDark"] as const,
  },
  surface: {
    bg: ["surface", "surfaceDark"] as const,
    fg: ["text", "textDark"] as const,
    border: ["transparent", "transparent"] as const,
    borderWidth: 0,
    shadow: ["surface", "surfaceDark"] as const,
  },
  elevated: {
    bg: ["surface", "surfaceDark"] as const,
    fg: ["text", "textDark"] as const,
    border: ["transparent", "transparent"] as const,
    borderWidth: 0,
    shadow: ["outer", "outerDark"] as const,
  },
  outline: {
    bg: ["surface", "surfaceDark"] as const,
    fg: ["text", "textDark"] as const,
    border: ["cardBorder", "cardBorderDark"] as const,
    borderWidth: 1,
    shadow: ["card", "cardDark"] as const,
  },
};

function shadowStyle(key: string): ViewStyle {
  const entry = (nativeTheme.shadows as Record<string, ViewStyle>)[key];
  return entry ?? {};
}

export const BaseCard: React.FC<BaseCardProps> = ({
  title,
  titleAlign = "center",
  variant = "default",
  accentColor,
  children,
  style,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const v = cardVariants[variant];

  const bg = useTokenColor(v.bg[0], v.bg[1]);
  const fg = useTokenColor(v.fg[0], v.fg[1]);
  const borderColor = useTokenColor(v.border[0], v.border[1]);
  const shadowKey = colorMode === "dark" ? v.shadow[1] : v.shadow[0];

  const layoutStyle = viewStyleFromProps(rest as StylePropBag, colorMode);
  const native = restNativeProps(rest as StylePropBag);

  return (
    <View
      style={[
        styles.card,
        shadowStyle(shadowKey),
        {
          backgroundColor: bg,
          borderWidth: v.borderWidth,
          borderColor,
        },
        layoutStyle,
        style as StyleProp<ViewStyle>,
      ]}
      {...(native as ViewProps)}
    >
      {accentColor ? (
        <View style={[styles.accent, { backgroundColor: accentColor }]} />
      ) : null}

      {title ? (
        <Text
          style={[
            styles.title,
            {
              color: fg,
              textAlign: titleAlign === "start" ? "left" : titleAlign === "end" ? "right" : titleAlign,
              paddingLeft: accentColor ? 8 : 0,
            },
          ]}
        >
          {title}
        </Text>
      ) : null}

      <View style={{ paddingLeft: accentColor && !title ? 8 : 0 }}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    overflow: "hidden",
    position: "relative",
  },
  accent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
});
