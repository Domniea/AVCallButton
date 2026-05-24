"use client";

import React from "react";
import { Box, Text, BoxProps } from "@chakra-ui/react";

type TitleAlign = "start" | "center" | "end";

interface BaseCardProps extends BoxProps {
  title?: string;
  titleAlign?: TitleAlign;
  variant?: "default" | "surface" | "elevated" | "outline";
  children?: React.ReactNode;
}

const variants = {
  default: {
    bg: "cardBg",
    shadow: "card",
    borderRadius: "xl",
    borderColor: "transparent",
    borderWidth: 0,
    p: 6,
    color: "text",
  },
  surface: {
    bg: "surface",
    shadow: "surface",
    borderRadius: "md",
    borderColor: "transparent",
    borderWidth: 0,
    p: 6,
    color: "text",
  },
  elevated: {
    bg: "surfaceElevated",
    shadow: "outer",
    borderRadius: "xl",
    borderColor: "transparent",
    borderWidth: 0,
    p: 6,
    color: "text",
  },
  outline: {
    bg: "surface",
    shadow: "subtle",
    borderRadius: "xl",
    borderColor: "cardBorder",
    borderWidth: 1,
    p: 6,
    color: "text",
  },
};

export const BaseCard: React.FC<BaseCardProps> = ({
  title,
  titleAlign = "center",
  variant = "default",
  children,
  ...rest
}) => {
  const v = variants[variant];

  return (
    <Box
      bg={v.bg}
      shadow={v.shadow}
      borderRadius={v.borderRadius}
      borderColor={v.borderColor}
      borderWidth={v.borderWidth}
      p={v.p}
      w="100%"
      color={v.color}
      {...rest}
    >
      {title && (
        <Text
          fontSize="lg"
          fontWeight="bold"
          textAlign={titleAlign}
          mb={3}
          minW={0}
          overflowWrap="break-word"
        >
          {title}
        </Text>
      )}

      {children}
    </Box>
  );
};
