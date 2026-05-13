"use client";

import React, { useEffect } from "react";
import { Box, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import type { RootState } from "@av/store";

export default function HomeEntryPage() {
  const router = useRouter();

  const authStatus = useSelector(
    (state: RootState) => state.auth.status
  );

  useEffect(() => {
    if (authStatus === "authenticated") {
      router.replace("/home");
    } else if (authStatus === "unauthenticated") {
      router.replace("/landingpage");
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
        bg="bg"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.500">Redirecting…</Text>
      </Box>
    );
  }

  return null;
}
