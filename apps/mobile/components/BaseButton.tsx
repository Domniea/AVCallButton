import React from "react";
import { Pressable, Box, Text, useColorModeValue } from "native-base";

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
}


const variantTokens = {
  primary: {
    bg: ["buttonPrimaryBg", "buttonPrimaryBgDark"],
    fg: ["buttonPrimaryFg", "buttonPrimaryFgDark"],
    pressed: ["buttonPrimaryHoverBg", "buttonPrimaryHoverBgDark"],
    border: ["transparent", "transparent"],
    borderWidth: 0,
    shadow: ["buttonPrimary", "buttonPrimaryDark"],
  },

  secondary: {
    bg: ["buttonSecondaryBg", "buttonSecondaryBgDark"],
    fg: ["buttonSecondaryFg", "buttonSecondaryFgDark"],
    pressed: ["buttonSecondaryHoverBg", "buttonSecondaryHoverBgDark"],
    border: ["buttonSecondaryBorder", "buttonSecondaryBorderDark"],
    borderWidth: 1,
    shadow: ["buttonSecondary", "buttonSecondaryDark"],
  },

  tertiary: {
    bg: ["transparent", "transparent"],
    fg: ["buttonTertiaryFg", "buttonTertiaryFgDark"],
    pressed: ["buttonTertiaryHoverBg", "buttonTertiaryHoverBgDark"],
    border: ["transparent", "transparent"],
    borderWidth: 0,
    shadow: ["buttonTertiary", "buttonTertiaryDark"],
  },
};


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
  ...rest
}) => {
  const v = variantTokens[variety];

  const bg = useColorModeValue(v.bg[0], v.bg[1]);
  const fg = useColorModeValue(v.fg[0], v.fg[1]);
  const pressed = useColorModeValue(v.pressed[0], v.pressed[1]);
  const border = useColorModeValue(v.border[0], v.border[1]);
  const shadow = useColorModeValue(v.shadow[0], v.shadow[1]);

  return (
    <Box
      w={btnWidth}
      alignSelf={center ? "center" : undefined}
      shadow={shadow}
      overflow="visible"
      borderRadius="xl"
    >
      <Pressable
        onPress={onPress}
        bg={bg}
        borderColor={border}
        borderWidth={v.borderWidth}
        borderRadius="xl"
        py={4}
        px={6}
        height={btnHeight}
        flexDir="row"
        alignItems="center"
        justifyContent="center"
        _pressed={{ bg: pressed }}
        {...rest}
      >
        {leftIcon}

        <Text
          color={fg}
          fontFamily="heading"
          fontSize="lg"
          mx={leftIcon || rightIcon ? 2 : 0}
        >
          {children ?? title}
        </Text>

        {rightIcon}
      </Pressable>
    </Box>
  );
};
