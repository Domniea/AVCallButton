import React from "react";
import { Button, IButtonProps, Text } from "native-base";

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
  },
  secondary: {
    bg: "button.secondary.bg",
    fg: "button.secondary.fg",
    pressed: "button.secondary.hover-bg",
    border: "button.secondary.border",
    borderWidth: 1,
  },
  tertiary: {
    bg: "transparent",
    fg: "button.tertiary.fg",
    pressed: "button.tertiary.hover-bg",
    border: "transparent",
    borderWidth: 0,
  },
};

export const BaseButton: React.FC<BaseButtonProps> = ({
  title,
  variety = "primary",
  btnHeight,           // optional override
  btnWidth = "100%",   // default full width
  center,
  leftIcon,
  rightIcon,
  children,
  ...rest
}) => {
  const v = variants[variety];

  const DEFAULT_TEXT_SIZE = "lg";
  const DEFAULT_PY = 4;
  const DEFAULT_PX = 6;

  return (
    <Button
      alignSelf={center ? "center" : undefined}
      width={btnWidth}
      height={btnHeight}
      bg={v.bg}
      borderWidth={v.borderWidth}
      borderColor={v.border}
      borderRadius="xl"
      py={DEFAULT_PY}
      px={DEFAULT_PX}
      my='md'
      _pressed={{ bg: v.pressed }}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      {...rest}
    >
      {children ? (
        children
      ) : (
        <Text
          color={v.fg}
          fontFamily="heading"
          fontSize={DEFAULT_TEXT_SIZE}
          textAlign="center"
        >
          {title}
        </Text>
      )}
    </Button>
  );
};
