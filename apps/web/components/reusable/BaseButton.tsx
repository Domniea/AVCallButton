"use client";

import React from "react";
import { Button as ChakraButton, Flex } from "@chakra-ui/react";
import { useColorMode } from "../ui/color-mode";

type ButtonVariant = "primary" | "secondary" | "tertiary";

interface BaseButtonProps {
  title?: string;
  variety?: ButtonVariant;
  btnHeight?: number | string;
  btnWidth?: number | string;
  margin?: number | string;
  center?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const variants = {
  primary: {
    bg: "buttonPrimaryBg",
    fg: "buttonPrimaryFg",
    hover: "buttonPrimaryHoverBg",
    border: "transparent",
    borderWidth: 0,
    shadow: { light: "buttonPrimary", dark: "buttonPrimaryDark" },
  },

  secondary: {
    bg: "buttonSecondaryBg",
    fg: "buttonSecondaryFg",
    hover: "buttonSecondaryHoverBg",
    border: "buttonSecondaryBorder",
    borderWidth: 1,
    shadow: { light: "buttonSecondary", dark: "buttonSecondaryDark" },
  },

  tertiary: {
    bg: "transparent",
    fg: "buttonTertiaryFg",
    hover: "buttonTertiaryHoverBg",
    border: "transparent",
    borderWidth: 0,
    shadow: { light: "buttonTertiary", dark: "buttonTertiaryDark" },
  },
};

export const BaseButton: React.FC<BaseButtonProps> = ({
  title,
  variety = "primary",
  btnWidth = "100%",
  btnHeight,
  center,
  margin = '1',
  children,
  onClick,
  ...rest
}) => {
  const { colorMode } = useColorMode();
  const v = variants[variety];

  const shadow = colorMode === "dark" ? v.shadow.dark : v.shadow.light;

  return (
    <Flex
      w={btnWidth}
      alignSelf={center ? "center" : undefined}
      shadow={shadow}
      borderRadius="xl"
    >
      <ChakraButton
        w="100%"
        h={btnHeight}
        bg={v.bg}
        color={v.fg}
        borderWidth={v.borderWidth}
        borderColor={v.border}
        borderRadius="xl"
        py={4}
        px={6}
        m={margin}
        _hover={{ bg: v.hover }}
        _active={{ bg: v.hover }}
        onClick={onClick}
        {...rest}
      >
        {children ?? title}
      </ChakraButton>
    </Flex>
  );
};
