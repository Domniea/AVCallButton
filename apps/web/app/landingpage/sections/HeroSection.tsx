"use client";

import React from "react";
import { Box, Flex, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import { LuShield } from "react-icons/lu";
import { useRouter } from "next/navigation";

import { BaseButton } from "@/components/reusable/BaseButton";
import HeroProductCarousel from "./HeroProductCarousel";

export default function HeroSection() {
  const router = useRouter();

  return (
    <Grid
      templateColumns={{ base: "1fr", lg: "1fr 1.15fr" }}
      gap={{ base: 6, lg: 8 }}
      alignItems="center"
      h="100%"
      w="100%"
      minH={0}
    >
      <VStack align="flex-start" gap={4} maxW="xl">
        <Box
          px={3}
          py={1}
          borderRadius="full"
          borderWidth="1px"
          borderColor="accent.500"
          bg="whiteAlpha.50"
        >
          <Text
            fontSize="xs"
            fontWeight="bold"
            letterSpacing="widest"
            color="accent.500"
          >
            ONE PLATFORM. EVERY SPACE.
          </Text>
        </Box>

        <Text
          fontSize={{ base: "3xl", md: "4xl", xl: "5xl" }}
          fontWeight="bold"
          lineHeight="1.05"
          color="text"
        >
          One platform.{" "}
          <Text as="span" color="accent.500">
            Every space.
          </Text>
        </Text>

        <Text fontSize={{ base: "sm", md: "md" }} color="textMuted" maxW="lg">
          Coordinate teams, monitor rooms, and resolve issues in real time
          across your entire organization.
        </Text>

        <HStack gap={3} flexWrap="wrap" w="100%">
          <BaseButton
            title="Book a Demo →"
            variety="primary"
            btnWidth="auto"
            onClick={() => router.push("/auth/signup")}
          />
          <BaseButton
            title="Start Free Trial"
            variety="secondary"
            btnWidth="auto"
            onClick={() => router.push("/auth/signup")}
          />
        </HStack>

        <HStack gap={4} flexWrap="wrap" color="textMuted" fontSize="xs">
          <HStack gap={1}>
            <Text color="yellow.400">★★★★★</Text>
            <Text>4.9/5 from 500+ customers</Text>
          </HStack>
          <HStack gap={1}>
            <Box as="span" color="accent.500" display="inline-flex">
              <LuShield />
            </Box>
            <Text>Enterprise-grade security</Text>
          </HStack>
        </HStack>
      </VStack>

      <Flex justify="center" align="center" h="100%" minH={0} minW={0}>
        <Box w="100%" maxW="640px" h="100%" minH={0}>
          <HeroProductCarousel />
        </Box>
      </Flex>
    </Grid>
  );
}
