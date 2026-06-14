import React from "react";
import { Box, VStack } from "@chakra-ui/react";
import LandingHeader from "./LandingHeader";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box minH="100vh" bg="bg">
      <VStack gap={{ base: 8, md: 12 }} maxW="7xl" mx="auto" align="stretch">
        <LandingHeader />
        {children}
      </VStack>
    </Box>
  );
}
