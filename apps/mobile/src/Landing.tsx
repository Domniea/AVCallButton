import React, { useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  HStack,
  Switch,
  useColorMode,
  useColorModeValue,
} from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";

import type { RootState } from "@av/store";

export default function Landing() {
  const navigation = useNavigation<any>();
  const { colorMode, toggleColorMode } = useColorMode();

  const authStatus = useSelector((state: RootState) => state.auth.status);

  useEffect(() => {
    if (authStatus === "authenticated") {
      navigation.replace("home" as never);
    }
  }, [authStatus, navigation]);

  const bg = useColorModeValue("bg", "bgDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");

  return (
    <Box flex={1} bg={bg} px="6" py="6" justifyContent="center">
      <VStack shadow="card" bg={surface} borderRadius="xl" p="8" space="6">
        {/* Header */}
        <VStack space="2">
          <Text fontSize="3xl" fontWeight="bold" color={textColor}>
            Welcome
          </Text>

          <Text fontSize="md" color={muted}>
            Sign in to continue to the app
          </Text>

          <Text fontSize="sm" color={muted}>
            Status: {authStatus}
          </Text>
        </VStack>

        {/* CTA */}
        <BaseButton
          title="Go to Login"
          variety="primary"
          onPress={() => navigation.navigate("login")}
        />

        {/* Theme Toggle */}
        <HStack alignItems="center" justifyContent="space-between" pt="6">
          <Text fontSize="lg" color={textColor}>
            {colorMode === "light" ? "Light Mode" : "Dark Mode"}
          </Text>

          <BaseCard variant="elevated" p="4">
            <Switch
              isChecked={colorMode === "dark"}
              onToggle={toggleColorMode}
            />
          </BaseCard>
        </HStack>
      </VStack>
    </Box>
  );
}
