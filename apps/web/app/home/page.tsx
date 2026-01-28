"use client";

import React from "react";
import { Box, VStack, Text, HStack, Flex } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import { useColorMode } from "@/components/ui/color-mode";
import type { RootState, AppDispatch } from "@av/store";
import { BaseButton } from "@/components/reusable/BaseButton";

import { logoutThunk } from "@av/store/src/auth";

export default function HomePage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const user = useSelector((state: RootState) => state.auth.user);

  console.log(user)
  
const onLogout = async () => {
  try {
    await dispatch(logoutThunk()).unwrap();
    router.replace("/");
  } catch (err) {
    console.error("Logout failed:", err);
  }
};
  const onResetPassword = () => {
    router.push("/auth/reset");
  };

  return (
    <Box
      height="100vh"
      flex={1}
      bg="bg"
      px={6}
      py={10}
      display="flex"
      justifyContent="center"
    >
      <VStack
        width="100%"
        maxWidth="480px"
        height="100%"
        alignItems="center"
        justifyContent="center"
        gap={6}
      >
        <VStack
          bg="bg"
          borderRadius="xl"
          p={8}
          gap={4}
          width="100%"
          maxWidth="480px"
          boxShadow="lg"
        >
          <Text fontSize="2xl" fontWeight="bold" color="text">
            Welcome to AV Call Button
          </Text>

          <Text fontSize="md" color="gray.500">
            Auth status: <strong>{authStatus}</strong>
          </Text>

          {authStatus === "authenticated" && user && (
            <VStack gap={1}>
              <Text fontSize="sm" color="text">
                Logged in as
              </Text>
              <Text fontSize="md" color="text" fontWeight="semibold">
                {user.email ?? user.id}
              </Text>
            </VStack>
          )}

          {authStatus === "unauthenticated" && (
            <Text fontSize="sm" color="red.400">
              Not logged in
            </Text>
          )}

          {authStatus === "authenticated" && (
            <BaseButton variety="tertiary" onClick={onResetPassword}>
              Reset Password
            </BaseButton>
          )}

          {authStatus === "authenticated" && (
            <BaseButton variety="secondary" onClick={onLogout}>
              Logout
            </BaseButton>
          )}
        </VStack>
        <HStack justifyContent="space-between" width="100%" pt={4}>
          <Flex gap="3" align="center">
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
              <Text color="text">{colorMode === "light" ? "🌞" : "🌙"}</Text>
            </Box>
          </Flex>
        </HStack>
      </VStack>
    </Box>
  );
}
