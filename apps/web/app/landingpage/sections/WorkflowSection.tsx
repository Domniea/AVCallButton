"use client";

import React from "react";
import { Text, VStack } from "@chakra-ui/react";
import { BaseCard } from "@/components/reusable/BaseCard";

type WorkflowSectionProps = {
  gridArea?: string;
};

export default function WorkflowSection({ gridArea }: WorkflowSectionProps) {
  return (
    <BaseCard p={3} h="100%" minH={0} gridArea={gridArea}>
      <VStack align="stretch" gap={1} h="100%" justify="center">
        <Text fontSize="sm" fontWeight="bold" color="text">
          Workflow
        </Text>
        <Text fontSize="xs" color="muted" lineClamp={2}>
          Step-by-step AV breakout flow placeholder
        </Text>
      </VStack>
    </BaseCard>
  );
}
