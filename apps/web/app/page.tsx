"use client";

import React, { useEffect } from "react";
import { Box, VStack, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import type { RootState } from "@av/store";
import { BaseButton } from "@/components/reusable/BaseButton";

export default function HomeEntryPage() {
  const router = useRouter();

  const authStatus = useSelector((state: RootState) => state.auth.status);

  useEffect(() => {
    if (authStatus === "authenticated") {
      router.replace("/dasboard");
    }
  }, [authStatus, router]);

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <Box
        height="100vh"
        bg="bg"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.500">Checking session…</Text>
      </Box>
    );
  }

  if (authStatus === "unauthenticated") {
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
            gap={8}
            width="100%"
            boxShadow="lg"
          >
            <Text fontSize="2xl" fontWeight="bold" color="text">
              Welcome to AV Call Button
            </Text>

            <BaseButton onClick={() => router.replace("/auth/login")}>
              Please sign in to continue
            </BaseButton>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return null;
}
