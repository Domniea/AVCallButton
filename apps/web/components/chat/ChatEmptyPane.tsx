"use client";

import { Box, Text, VStack } from "@chakra-ui/react";

/** Right-pane placeholder when no thread is selected. */
export function ChatEmptyPane() {
  return (
    <VStack
      align="center"
      justify="center"
      gap={3}
      h="100%"
      minH={0}
      px={8}
      bg="bg"
      textAlign="center"
      backgroundImage="radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--chakra-colors-cardBorder) 55%, transparent) 1px, transparent 0)"
      backgroundSize="18px 18px"
    >
      <Box
        w="64px"
        h="64px"
        borderRadius="full"
        borderWidth={1}
        borderColor="cardBorder"
        bg="surface"
      />
      <Text fontSize="md" fontWeight="semibold" color="text">
        Select a conversation
      </Text>
      <Text fontSize="sm" color="gray.500" maxW="280px">
        Pick a thread from the list, or start a new message.
      </Text>
    </VStack>
  );
}
