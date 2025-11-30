import React from "react";
import { Box, Button, IButtonProps, Text } from "native-base";

type ButtonVariant = "primary" | "secondary" | "tertiary";

interface BaseButtonProps extends IButtonProps {
  title?: string;
  variety?: ButtonVariant;
  btnHeight?: number | string;
  btnWidth?: number | string;
  center?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const variants = {
  primary: {
    bg: "button.primary.bg",
    fg: "button.primary.fg",
    pressed: "button.primary.hover-bg",
    border: "transparent",
    borderWidth: 0,
    shadow: "card",
  },
  secondary: {
    bg: "button.secondary.bg",
    fg: "button.secondary.fg",
    pressed: "button.secondary.hover-bg",
    border: "button.secondary.border",
    borderWidth: 1,
    shadow: "surface",
  },
  tertiary: {
    bg: "transparent",
    fg: "button.tertiary.fg",
    pressed: "button.tertiary.hover-bg",
    border: "transparent",
    borderWidth: 0,
    shadow: "none",
  },
};

export const BaseButton: React.FC<BaseButtonProps> = ({
  title,
  variety = "primary",
  btnHeight,
  btnWidth = "100%",
  center,
  leftIcon,
  rightIcon,
  children,
  ...rest
}) => {
  const v = variants[variety];

  return (
    <Box
      width={btnWidth}
      alignSelf={center ? "center" : undefined}
      shadow={v.shadow}     // ← shadow HERE, not on Button
      borderRadius="xl"
    >
      <Button
        width="100%"
        height={btnHeight}
        bg={v.bg}
        borderWidth={v.borderWidth}
        borderColor={v.border}
        borderRadius="xl"
        overflow="visible"
        py="4"
        px="6"
        _pressed={{ bg: v.pressed }}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        {...rest}
      >
        {children ? (
          children
        ) : (
          <Text fontFamily="heading" color={v.fg} fontSize="xl" textAlign="center">
            {title}
          </Text>
        )}
      </Button>
    </Box>
  );
};
