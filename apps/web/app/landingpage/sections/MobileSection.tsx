"use client";

import React from "react";
import { Box, Text, VStack } from "@chakra-ui/react";
import { BaseCard } from "@/components/reusable/BaseCard";

type MobileSectionProps = {
  gridArea?: string;
};

export default function MobileSection({ gridArea }: MobileSectionProps) {
  return (
    <BaseCard p={3} h="100%" minH={0} gridArea={gridArea}>
      <VStack align="stretch" gap={2} h="100%">
        <Text fontSize="sm" fontWeight="bold" color="text">
          Mobile
        </Text>
        <Box flex="1" minH="60px" bg="bgMuted" borderRadius="md" />
      </VStack>
    </BaseCard>
  );
}
