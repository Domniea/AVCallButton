import React, { type ReactNode } from "react";
import { Box, VStack, Text } from "native-base";
import { BaseCard } from "./BaseCard";
import { useThemeColors } from "../hooks/useThemeColors";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { bg, text, muted } = useThemeColors();

  return (
    <Box flex={1} bg={bg} px={6} py={6} justifyContent="center">
      <BaseCard variant="elevated" p={8} maxW="480" alignSelf="center" w="100%">
        <VStack space={6}>
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

          {children}

          {footer}
        </VStack>
      </BaseCard>
    </Box>
  );
}
