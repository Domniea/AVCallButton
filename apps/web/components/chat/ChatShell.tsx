"use client";

import type { ReactNode } from "react";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";

type ChatFrameProps = {
  children: ReactNode;
};

/** Outer page wash + tall chat window (split or single). */
export function ChatFrame({ children }: ChatFrameProps) {
  return (
    <Box
      minHeight="100vh"
      bg="bg"
      px={{ base: 0, md: 6 }}
      py={{ base: 0, md: 6 }}
      backgroundImage={{
        base: undefined,
        md: "radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in srgb, var(--chakra-colors-buttonPrimaryBg) 12%, transparent), transparent)",
      }}
    >
      <Box
        maxW="1180px"
        mx="auto"
        h={{ base: "100vh", md: "calc(100vh - 3rem)" }}
        borderWidth={{ base: 0, md: 1 }}
        borderColor="cardBorder"
        borderRadius={{ base: 0, md: "2xl" }}
        bg="surfaceElevated"
        shadow={{ base: "none", md: "outer" }}
        overflow="hidden"
        display="flex"
        flexDir="column"
      >
        {children}
      </Box>
    </Box>
  );
}

type ChatPaneHeaderProps = {
  title: string;
  subtitle?: string | null;
  headerRight?: ReactNode;
};

export function ChatPaneHeader({
  title,
  subtitle,
  headerRight,
}: ChatPaneHeaderProps) {
  return (
    <HStack
      justify="space-between"
      align="center"
      gap={3}
      px={{ base: 4, md: 5 }}
      py={3.5}
      borderBottomWidth={1}
      borderBottomColor="cardBorder"
      bg="surface"
      flexShrink={0}
    >
      <Box minW={0} flex={1}>
        <Text
          fontSize="md"
          fontWeight="semibold"
          color="text"
          truncate
          letterSpacing="-0.01em"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text fontSize="xs" color="gray.500" truncate mt={0.5}>
            {subtitle}
          </Text>
        ) : null}
      </Box>
      {headerRight ? (
        <HStack gap={2} flexShrink={0}>
          {headerRight}
        </HStack>
      ) : null}
    </HStack>
  );
}

/** Initials chip — gives list rows visual weight without icons. */
export function ChatAvatar({ label }: { label: string }) {
  const initials = label
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Box
      w="40px"
      h="40px"
      borderRadius="full"
      bg="bg"
      borderWidth={1}
      borderColor="cardBorder"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      <Text fontSize="xs" fontWeight="semibold" color="gray.500">
        {initials || "?"}
      </Text>
    </Box>
  );
}

/** @deprecated Prefer ChatFrame + ChatPaneHeader for split layout. */
export function ChatShell({
  title,
  subtitle,
  headerRight,
  footer,
  children,
  fillHeight = false,
}: {
  title: string;
  subtitle?: string | null;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  fillHeight?: boolean;
}) {
  return (
    <ChatFrame>
      <VStack
        align="stretch"
        gap={0}
        flex={1}
        minH={0}
        h={fillHeight ? "100%" : undefined}
      >
        <ChatPaneHeader
          title={title}
          subtitle={subtitle}
          headerRight={headerRight}
        />
        <Box flex={1} minH={0} display="flex" flexDir="column">
          {children}
        </Box>
        {footer ? (
          <Box
            flexShrink={0}
            borderTopWidth={1}
            borderTopColor="cardBorder"
            bg="surface"
            px={{ base: 3, md: 4 }}
            py={3}
          >
            {footer}
          </Box>
        ) : null}
      </VStack>
    </ChatFrame>
  );
}
