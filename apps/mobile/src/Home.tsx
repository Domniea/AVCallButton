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

import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";

import type { AppDispatch, RootState } from "@av/store";
import { authUnauthenticated } from "@av/store/src/auth";
import { useNavigation } from "@react-navigation/native";
import { logout } from "packages/auth-client/src";

import { fetchAuthSession } from "aws-amplify/auth";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const navigator = useNavigation();
  const { colorMode, toggleColorMode } = useColorMode();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const user = useSelector((state: RootState) => state.auth.user);

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      dispatch(authUnauthenticated());
      navigator.navigate("landing" as never);
    }
  };

  const bg = useColorModeValue("bg", "bgDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");

useEffect(() => {
  let mounted = true;

  const loadSession = async () => {
    const session = await fetchAuthSession();
    if (!mounted) return;
    console.log("ID TOKEN:", session.tokens?.idToken?.toString());
  };

  loadSession();

  return () => {
    mounted = false;
  };
}, []);
  
  return (
    <Box flex={1} bg={bg} px="6" py="6" justifyContent="center">
      <VStack shadow="card" bg={surface} borderRadius="xl" p="8" space="6">
        <VStack space="1">
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            Home
          </Text>

          <Text fontSize="sm" color={muted}>
            Status: {authStatus}
          </Text>
        </VStack>

        {/* User Info */}
        {user?.email && (
          <BaseCard p="4">
            <VStack space="1">
              <Text fontSize="sm" color={muted}>
                Signed in as
              </Text>
              <Text fontSize="md" fontWeight="medium" color={textColor}>
                {user.email}
              </Text>
            </VStack>
          </BaseCard>
        )}

        {/* Actions */}
        <BaseButton title="Logout" variety="secondary" onPress={onLogout} />

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
