import React, { type ReactNode } from "react";
import { Box, VStack, Text, ScrollView } from "native-base";
import { useThemeColors } from "../hooks/useThemeColors";

interface ScreenLayoutProps {
  title?: string;
  subtitle?: string;
  maxW?: string | number;
  children: ReactNode;
}

export function ScreenLayout({
  title,
  subtitle,
  maxW = "960",
  children,
}: ScreenLayoutProps) {
  const { bg, text, muted } = useThemeColors();

  return (
    <Box flex={1} bg={bg}>
      <ScrollView px={6} py={6} contentContainerStyle={{ paddingBottom: 32 }}>
        <VStack space={6} maxW={maxW} alignSelf="center" w="100%">
          {title ? (
            <VStack space={1}>
              <Text fontSize="2xl" fontWeight="bold" fontFamily="heading" color={text}>
                {title}
              </Text>
              {subtitle ? (
                <Text fontSize="sm" color={muted}>
                  {subtitle}
                </Text>
              ) : null}
            </VStack>
          ) : null}

          {children}
        </VStack>
      </ScrollView>
    </Box>
  );
}
