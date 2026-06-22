import React from "react";
import { Pressable, Text, HStack, Icon, useColorModeValue } from "native-base";
import { Ionicons } from "@expo/vector-icons";

type InlineActionVariant = "default" | "outline" | "danger";

interface InlineActionProps {
  title: string;
  onPress?: () => void;
  variant?: InlineActionVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export function InlineAction({
  title,
  onPress,
  variant = "default",
  icon,
  disabled,
}: InlineActionProps) {
  const defaultFg = useColorModeValue("primary.600", "accent.600");
  const outlineBorder = useColorModeValue("cardBorder", "cardBorderDark");
  const outlineFg = useColorModeValue("text", "textDark");
  const dangerFg = useColorModeValue("red.600", "red.300");
  const pressedBg = useColorModeValue("primary.50", "primary.900");

  const fg =
    variant === "danger" ? dangerFg : variant === "outline" ? outlineFg : defaultFg;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      opacity={disabled ? 0.5 : 1}
      borderWidth={variant === "outline" ? 1 : 0}
      borderColor={outlineBorder}
      borderRadius="md"
      px={2}
      py={0.5}
      _pressed={{ bg: pressedBg, opacity: 0.85 }}
      accessibilityRole="button"
    >
      <HStack alignItems="center" space={1}>
        {icon ? (
          <Icon as={Ionicons} name={icon} size="xs" color={fg} />
        ) : variant === "default" ? (
          <Icon as={Ionicons} name="add" size="xs" color={fg} />
        ) : null}
        <Text fontSize="xs" fontWeight="medium" color={fg}>
          {title}
        </Text>
      </HStack>
    </Pressable>
  );
}
