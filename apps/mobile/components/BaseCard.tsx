import React from "react";
import { Box, Text, IBoxProps, useColorModeValue } from "native-base";

type TitleAlign = "start" | "center" | "end";

interface BaseCardProps extends IBoxProps {
  title?: string;
  titleAlign?: TitleAlign;
  variant?: "default" | "surface" | "elevated" | "outline";
  accentColor?: string;
}

const cardVariants = {
  default: {
    bg: ["cardBg", "cardBgDark"],
    fg: ["text", "textDark"],
    border: ["transparent", "transparent"],
    borderWidth: 0,
    shadow: ["card", "cardDark"],
  },

  surface: {
    bg: ["surface", "surfaceDark"],
    fg: ["text", "textDark"],
    border: ["transparent", "transparent"],
    borderWidth: 0,
    shadow: ["surface", "surfaceDark"],
  },

  elevated: {
    bg: ["surface", "surfaceDark"],
    fg: ["text", "textDark"],
    border: ["transparent", "transparent"],
    borderWidth: 0,
    shadow: ["outer", "outerDark"],
  },

  outline: {
    bg: ["surface", "surfaceDark"],
    fg: ["text", "textDark"],
    border: ["cardBorder", "cardBorderDark"],
    borderWidth: 1,
    shadow: ["subtle", "subtleDark"],
  },
};

export const BaseCard: React.FC<BaseCardProps> = ({
  title,
  titleAlign = "center",
  variant = "default",
  accentColor,
  children,
  ...rest
}) => {
  const v = cardVariants[variant];

  const bg = useColorModeValue(v.bg[0], v.bg[1]);
  const fg = useColorModeValue(v.fg[0], v.fg[1]);
  const shadow = useColorModeValue(v.shadow[0], v.shadow[1]);
  const borderColor = useColorModeValue(v.border[0], v.border[1]);

  return (
    <Box
      bg={bg}
      shadow={shadow}
      borderRadius="xl"
      borderWidth={v.borderWidth}
      borderColor={borderColor}
      p={6}
      overflow="hidden"
      position="relative"
      {...rest}
    >
      {accentColor ? (
        <Box
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          w={1}
          bg={accentColor}
        />
      ) : null}

      {title && (
        <Text
          fontFamily="heading"
          fontSize="lg"
          fontWeight="semibold"
          textAlign={titleAlign}
          mb={3}
          color={fg}
          pl={accentColor ? 2 : 0}
        >
          {title}
        </Text>
      )}

      <Box pl={accentColor && !title ? 2 : 0}>{children}</Box>
    </Box>
  );
};
