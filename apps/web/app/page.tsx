"use client";

import React from "react";
import { Box, VStack, Text, Flex } from "@chakra-ui/react";

import { useColorMode } from "../components/ui/color-mode";
import { BaseInput } from "@/components/reusable/BaseInput";
import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseCard } from "@/components/reusable/BaseCard";

export default function Test() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex
      flex="1"
      h="100vh"
      bg="bg"
      justify="center"
      px="6"
      py="6"
    >
      {/* Theme Switcher */}
      <Flex
        position="absolute"
        top="10"
        right="10"
        gap="3"
        align="center"
      >
        <Text fontSize="lg" color="text">
          {colorMode === "light" ? "Light" : "Dark"}
        </Text>

        <Box
          as="button"
          onClick={toggleColorMode}
          bg="surface"
          borderRadius="full"
          px="3"
          py="1"
          shadow="sm"
        >
          <Text color="text">
            {colorMode === "light" ? "🌞" : "🌙"}
          </Text>
        </Box>
      </Flex>

      {/* Main UI Container */}
      <VStack
        shadow="card"
        bg="surface"
        borderRadius="xl"
        p="8"
        gap="xl"
        w="100%"
        maxW="xl"
        h="100%"
        justify="space-evenly"
      >
        <BaseInput label="Email" placeholder="email@example.com" shadow="card" />
        <BaseInput label="Password" placeholder="••••••••" shadow="card" />

        <BaseButton title="Submit" variety="primary" />
        <BaseButton title="Submit" variety="secondary" />
        <BaseButton title="Submit" variety="tertiary" />


        <BaseCard>
          <Text textAlign="center">Test Card Shadow</Text>
        </BaseCard>
      </VStack>
    </Flex>
  );
}
