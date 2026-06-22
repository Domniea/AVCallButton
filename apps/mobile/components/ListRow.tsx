import React, { type ReactNode } from "react";
import { Box, HStack, Text, Pressable, Icon } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../hooks/useThemeColors";

interface ListRowProps {
  title: string;
  subtitle?: string;
  meta?: string;
  accentColor?: string;
  onPress?: () => void;
  rightElement?: ReactNode;
  children?: ReactNode;
}

export function ListRow({
  title,
  subtitle,
  meta,
  accentColor,
  onPress,
  rightElement,
  children,
}: ListRowProps) {
  const { surface, text, muted, border } = useThemeColors();

  const content = (
    <Box
      bg={surface}
      borderWidth={1}
      borderColor={border}
      borderRadius="lg"
      overflow="hidden"
      shadow="subtle"
    >
      {accentColor ? (
        <Box position="absolute" left={0} top={0} bottom={0} w={1} bg={accentColor} />
      ) : null}

      <HStack alignItems="center" px={4} py={3} pl={accentColor ? 5 : 4} space={3}>
        <Box flex={1}>
          <Text fontSize="md" fontWeight="semibold" color={text} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text fontSize="xs" color={muted} mt={0.5} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
          {meta ? (
            <Text fontSize="xs" color={muted} mt={1}>
              {meta}
            </Text>
          ) : null}
          {children}
        </Box>

        {rightElement ??
          (onPress ? (
            <Icon as={Ionicons} name="chevron-forward" size="sm" color={muted} />
          ) : null)}
      </HStack>
    </Box>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} _pressed={{ opacity: 0.85 }}>
        {content}
      </Pressable>
    );
  }

  return content;
}
