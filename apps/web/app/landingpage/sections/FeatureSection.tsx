"use client";

import React from "react";
import { Box, Flex, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import {
  LuChartBar,
  LuBuilding2,
  LuMessageSquare,
  LuUsers,
} from "react-icons/lu";

import { FEATURE_ITEMS } from "../data/features";

const ICONS = {
  alerts: LuMessageSquare,
  rooms: LuBuilding2,
  team: LuUsers,
  insights: LuChartBar,
} as const;

export default function FeatureSection() {
  return (
    <Box
      w="100%"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      borderRadius="xl"
      bg="whiteAlpha.50"
      px={{ base: 4, md: 6 }}
      py={{ base: 3, md: 4 }}
      h="100%"
      minH={0}
    >
      <Grid
        templateColumns={{ base: "1fr 1fr", lg: "repeat(4, 1fr)" }}
        gap={{ base: 4, lg: 6 }}
        h="100%"
        alignItems="center"
      >
        {FEATURE_ITEMS.map((feature) => {
          const Icon = ICONS[feature.icon];

          return (
            <HStack key={feature.id} align="flex-start" gap={3} minW={0}>
              <Flex
                w={10}
                h={10}
                borderRadius="full"
                bg="accent.500"
                color="primary.900"
                align="center"
                justify="center"
                flexShrink={0}
                fontSize="lg"
              >
                <Icon />
              </Flex>
              <VStack align="flex-start" gap={0.5} minW={0}>
                <Text fontSize="sm" fontWeight="bold" color="text">
                  {feature.title}
                </Text>
                <Text fontSize="xs" color="textMuted" lineClamp={2}>
                  {feature.description}
                </Text>
              </VStack>
            </HStack>
          );
        })}
      </Grid>
    </Box>
  );
}
