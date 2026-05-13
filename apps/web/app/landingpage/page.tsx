"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

import { BaseButton } from "@/components/reusable/BaseButton";

import { INDUSTRY_SLIDES } from "./industries";

export default function LandingPage() {
  const router = useRouter();
  const slides = INDUSTRY_SLIDES;
  const [slideIndex, setSlideIndex] = useState(0);
  const count = slides.length;

  const go = (delta: number) => {
    if (count === 0) return;
    setSlideIndex((i) => (i + delta + count) % count);
  };

  if (count === 0) {
    return (
      <Box minH="100vh" bg="bg" p={8}>
        <Text color="text">No industry slides configured.</Text>
      </Box>
    );
  }

  const slide = slides[((slideIndex % count) + count) % count]!;

  return (
    <Box minH="100vh" bg="bg" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
      <VStack gap={{ base: 8, md: 12 }} maxW="6xl" mx="auto" align="stretch">
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
          <Text fontSize="xl" fontWeight="bold" color="text">
            AV Call Button
          </Text>
          <HStack gap={3}>
            <BaseButton
              title="Log in"
              variety="secondary"
              onClick={() => router.push("/auth/login")}
            />
            <BaseButton
              title="Sign up"
              variety="primary"
              onClick={() => router.push("/auth/signup")}
            />
          </HStack>
        </HStack>

        <VStack align="stretch" gap={4}>
          <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="bold" color="text">
            AV breakout, built for your industry
          </Text>
          <Text fontSize="md" color="gray.600" maxW="2xl">
            One place to see where AV Call Button fits—then create an account or sign in.
          </Text>
          <HStack gap={3} flexWrap="wrap">
            <BaseButton
              title="Sign up"
              variety="primary"
              onClick={() => router.push("/auth/signup")}
            />
            <BaseButton
              title="Log in"
              variety="secondary"
              onClick={() => router.push("/auth/login")}
            />
          </HStack>
        </VStack>

        <Box
          role="region"
          aria-roledescription="carousel"
          aria-label="Industries"
          borderRadius="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor="gray.200"
          bg="bg"
          boxShadow="md"
        >
          <Box position="relative" w="100%" aspectRatio={{ base: "16/10", md: "16/9" }}>
            <Image
              src={slide.imageSrc}
              alt={slide.label}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              style={{ objectFit: "cover" }}
              priority={slideIndex === 0}
            />
          </Box>

          <VStack align="stretch" gap={3} p={{ base: 4, md: 6 }}>
            <Text fontSize="xl" fontWeight="semibold" color="text">
              {slide.label}
            </Text>
            <Text color="gray.600">{slide.description}</Text>

            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <HStack gap={2}>
                <BaseButton title="Previous" variety="tertiary" onClick={() => go(-1)} />
                <BaseButton title="Next" variety="tertiary" onClick={() => go(1)} />
              </HStack>
              <HStack gap={2} aria-label="Slide indicators">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Show ${s.label}`}
                    aria-current={i === slideIndex ? "true" : undefined}
                    onClick={() => setSlideIndex(i)}
                    title={s.label}
                    style={{
                      width: i === slideIndex ? 10 : 8,
                      height: i === slideIndex ? 10 : 8,
                      borderRadius: 9999,
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      backgroundColor:
                        i === slideIndex ? "#3182ce" : "#cbd5e1",
                    }}
                  />
                ))}
              </HStack>
            </HStack>
          </VStack>
        </Box>

        <Flex justify="center" pt={2}>
          <HStack gap={3}>
            <BaseButton
              title="Sign up"
              variety="primary"
              onClick={() => router.push("/auth/signup")}
            />
            <BaseButton
              title="Log in"
              variety="secondary"
              onClick={() => router.push("/auth/login")}
            />
          </HStack>
        </Flex>
      </VStack>
    </Box>
  );
}
