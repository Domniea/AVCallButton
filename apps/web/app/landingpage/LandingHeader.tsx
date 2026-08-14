"use client";

import React from "react";
import { Box, HStack, Link, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

import { BaseButton } from "@/components/reusable/BaseButton";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Industries", href: "#industries" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#resources" },
  { label: "About", href: "#about" },
];

export default function LandingHeader() {
  const router = useRouter();

  return (
    <Box
      as="header"
      w="full"
      bg="primary.900"
      borderBottomWidth="1px"
      borderColor="whiteAlpha.100"
    >
      <HStack
        justify="space-between"
        w="full"
        maxW="7xl"
        mx="auto"
        px={{ base: 4, md: 6 }}
        py={3}
        gap={4}
      >
        <HStack gap={2}>
          <Box
            w={7}
            h={7}
            borderRadius="md"
            bg="accent.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box w={3} h={3} borderRadius="sm" bg="primary.900" />
          </Box>
          <Text fontSize="md" fontWeight="bold" color="text">
            WarRoom(TM)
          </Text>
        </HStack>

        <HStack
          gap={5}
          display={{ base: "none", lg: "flex" }}
          flex="1"
          justify="center"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              fontSize="sm"
              color="textMuted"
              _hover={{ color: "accent.500" }}
            >
              {link.label}
            </Link>
          ))}
        </HStack>

        <HStack gap={2} flexShrink={0}>
          <BaseButton
            title="Log in"
            variety="secondary"
            btnWidth="auto"
            onClick={() => router.push("/auth/login")}
          />
          <BaseButton
            title="Sign up"
            variety="primary"
            btnWidth="auto"
            onClick={() => router.push("/auth/signup")}
          />
        </HStack>
      </HStack>
    </Box>
  );
}
