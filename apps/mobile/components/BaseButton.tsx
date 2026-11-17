import React, { useState } from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { Button, useTokenColor } from "./ui/gluestack";

type ButtonVariant = "primary" | "secondary" | "tertiary";

interface BaseButtonProps {
  title?: string;
  variety?: ButtonVariant;
  btnHeight?: number | string;
  btnWidth?: number | string;
  center?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  onPress?: () => void;
  isDisabled?: boolean;
}

/**
 * Primary is pinned to brand solids so token path issues can't wash out CTAs.
 * Matches packages/ui semanticTokens buttonPrimary*:
 *   bg #01796F (primary.500), fg #F2F2F2 (tertiary.50), pressed #01685F
 */
const PRIMARY = {
  bg: "#01796F",
  fg: "#F2F2F2",
  pressed: "#01685F",
  border: "transparent",
  borderWidth: 0,
} as const;

export const BaseButton: React.FC<BaseButtonProps> = ({
  title,
  variety = "primary",
  btnWidth = "100%",
  btnHeight,
  center,
  leftIcon,
  rightIcon,
  children,
  onPress,
  isDisabled,
}) => {
  const [pressed, setPressed] = useState(false);

  const secondaryBg = useTokenColor("buttonSecondaryBg", "buttonSecondaryBgDark");
  const secondaryFg = useTokenColor("buttonSecondaryFg", "buttonSecondaryFgDark");
  const secondaryPressed = useTokenColor(
    "buttonSecondaryHoverBg",
    "buttonSecondaryHoverBgDark",
  );
  const secondaryBorder = useTokenColor(
    "buttonSecondaryBorder",
    "buttonSecondaryBorderDark",
  );
  const tertiaryFg = useTokenColor("buttonTertiaryFg", "buttonTertiaryFgDark");
  const tertiaryPressed = useTokenColor(
    "buttonTertiaryHoverBg",
    "buttonTertiaryHoverBgDark",
  );

  let bg: string;
  let fg: string;
  let pressedBg: string;
  let border: string;
  let borderWidth: number;

  if (variety === "primary") {
    bg = PRIMARY.bg;
    fg = PRIMARY.fg;
    pressedBg = PRIMARY.pressed;
    border = PRIMARY.border;
    borderWidth = PRIMARY.borderWidth;
  } else if (variety === "secondary") {
    bg = secondaryBg;
    fg = secondaryFg;
    pressedBg = secondaryPressed;
    border = secondaryBorder;
    borderWidth = 1;
  } else {
    bg = "transparent";
    fg = tertiaryFg;
    pressedBg = tertiaryPressed;
    border = "transparent";
    borderWidth = 0;
  }

  const widthStyle: ViewStyle =
    btnWidth === "100%" || btnWidth === "full"
      ? { alignSelf: "stretch", width: "100%" }
      : {
          width: btnWidth as ViewStyle["width"],
          alignSelf: center ? "center" : undefined,
        };

  return (
    <View style={[styles.wrap, widthStyle, center ? styles.center : null]}>
      <Button
        accessibilityRole="button"
        isDisabled={isDisabled}
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={[
          styles.button,
          {
            backgroundColor: pressed ? pressedBg : bg,
            borderColor: border,
            borderWidth,
            height: typeof btnHeight === "number" ? btnHeight : undefined,
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
      >
        {leftIcon}
        <Button.Text
          style={[
            styles.label,
            {
              color: fg,
              marginHorizontal: leftIcon || rightIcon ? 8 : 0,
            },
          ]}
        >
          {children ?? title}
        </Button.Text>
        {rightIcon}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 24,
    overflow: "visible",
  },
  center: {
    alignSelf: "center",
  },
  button: {
    minHeight: 48,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
  },
});
