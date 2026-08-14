"use client";

import React from "react";
import { Text, VStack } from "@chakra-ui/react";
import { BaseCard } from "@/components/reusable/BaseCard";

type CTASectionProps = {
  gridArea?: string;
};

export default function CTASection({ gridArea }: CTASectionProps) {
  return (
    <BaseCard variant="outline" p={3} h="100%" minH={0} gridArea={gridArea}>
      <VStack align="stretch" gap={0} justify="center" h="100%">
        <Text fontSize="sm" fontWeight="bold" color="text">
          Ready to get started?
        </Text>
        <Text fontSize="xs" color="muted">
          Use Log in or Sign up in the header.
        </Text>
      </VStack>
    </BaseCard>
  );
}
