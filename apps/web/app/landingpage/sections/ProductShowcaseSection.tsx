"use client";

import React from "react";
import { Text, VStack } from "@chakra-ui/react";
import { BaseCard } from "@/components/reusable/BaseCard";

export default function ProductShowcaseSection() {
  return (
    <BaseCard variant="elevated">
      <VStack align="stretch" gap={2}>
        <Text fontSize="lg" fontWeight="bold" color="text">
          Product Showcase
        </Text>
        <Text fontSize="md" color="muted">
          Dashboard screenshot placeholder
        </Text>
      </VStack>
    </BaseCard>
  );
}
