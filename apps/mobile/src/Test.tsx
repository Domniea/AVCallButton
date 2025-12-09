"use client";

import React from "react";
import {
  Box,
  VStack,
  Text,
  HStack,
  Switch,
  useColorMode,
  useColorModeValue,
} from "native-base";

import { BaseInput } from "../components/BaseInput";
import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";

export default function TestScreen() {
  const { colorMode, toggleColorMode } = useColorMode();

  const bg = useColorModeValue("bg", "bgDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const cardBg = useColorModeValue("cardBg", "cardBgDark");
  const textColor = useColorModeValue("text", "textDark");

  return (
    <Box
      flex={1}
      bg={bg}
      px="6"
      py="6"
      justifyContent="center"
    >
      <VStack
        shadow="card"
        bg={surface} 
        borderRadius="xl"
        p="8"
        space="xl"
        w="100%"
        maxW="xl"
        height="100%"
        justifyContent="space-evenly"
        alignSelf="center"
      >
        
        <BaseInput
          label="Email"
          placeholder="email@example.com"
        />

      
        <BaseInput
          label="Password"
          placeholder="••••••••"
        />

        <BaseButton title="Submit" variety="primary" />
        <BaseButton title="Submit" variety="secondary" />
        <BaseButton title="Submit" variety="tertiary" />

        <BaseCard title="Test Card Shadow" />

        <HStack>
          <Text fontSize="lg" color={textColor}>
            {colorMode === "light" ? "Light" : "Dark"}
          </Text>

          <Switch isChecked={colorMode === "dark"} onToggle={toggleColorMode} />
        </HStack>

      </VStack>
    </Box>
  );
}
