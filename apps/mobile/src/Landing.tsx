import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Text,
  HStack,
  Switch,
  Input,
  useColorMode,
  useColorModeValue,
} from "native-base";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ParamListBase } from "@react-navigation/native";

import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";

import type { RootState } from "@av/store";

type LandingNav = NativeStackNavigationProp<
  ParamListBase & { invite: { token?: string }; login: undefined },
  "landing"
>;

export default function Landing() {
  const navigation = useNavigation<LandingNav>();
  const { colorMode, toggleColorMode } = useColorMode();
  const [devInviteToken, setDevInviteToken] = useState("");

  const authStatus = useSelector((state: RootState) => state.auth.status);

  useEffect(() => {
    if (authStatus === "authenticated") {
      navigation.replace("dashboard");
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

        {/* Dev: test invite without terminal */}
        {__DEV__ && (
          <VStack space="2" pt="2" borderTopWidth="1" borderTopColor={muted}>
            <Text fontSize="sm" color={muted}>
              Dev: paste invite token and open
            </Text>
            <Input
              placeholder="Invite token"
              value={devInviteToken}
              onChangeText={setDevInviteToken}
              size="sm"
              bg={bg}
              _focus={{ borderColor: "primary.500" }}
            />
            <BaseButton
              title="Open invite flow"
              variety="secondary"
              onPress={() => {
                if (devInviteToken.trim()) {
                  navigation.navigate("invite", { token: devInviteToken.trim() });
                }
              }}
            />
          </VStack>
        )}

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
