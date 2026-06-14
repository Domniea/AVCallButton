"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { BaseCard } from "@/components/reusable/BaseCard";

{
  /**|use chakra ui components for carousel? maybe|*/
}

import { BaseButton } from "@/components/reusable/BaseButton";

import { INDUSTRY_SLIDES } from "./industries";

export default function LandingPage() {
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
        <VStack align="stretch" gap={4}>
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="bold"
            color="text"
          >
            Built for your industry
          </Text>
          <Text fontSize="md" color="muted" maxW="2xl">
            One place to see where AV Call Button fits—then create an account or
            sign in.
          </Text>
          <HStack gap={3} flexWrap="wrap"></HStack>
        </VStack>

        <BaseCard
          role="region"
          aria-roledescription="carousel"
          aria-label="Industries"
          borderRadius="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor="muted"
          bg="bg"
          boxShadow="md"
        >
          {/*|change carousel style here|*/}
          <BaseCard
            variant="elevated"
            shadow="outer"
            p={0}
            position="relative"
            w="100%"
            aspectRatio={{ base: "16/10", md: "16/9" }}
          >
            <Image
              key={slide.id}
              src={slide.imageSrc}
              alt={slide.label}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              style={{ objectFit: "cover" }}
              priority={slideIndex === 0}
            />
          </BaseCard>

          <VStack align="stretch" gap={6} p={{ base: 4, md: 6 }}>
            <Text fontSize="xl" fontWeight="semibold" color="text">
              {slide.label}
            </Text>
            <Text color="muted">{slide.description}</Text>

            <HStack justify="space-between" flexWrap="wrap" gap={3}>
              <HStack gap={2}>
                <BaseButton
                  title="Previous"
                  variety="tertiary"
                  onClick={() => go(-1)}
                />
                <BaseButton
                  title="Next"
                  variety="tertiary"
                  onClick={() => go(1)}
                />
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
                      backgroundColor: i === slideIndex ? "#3182ce" : "#cbd5e1",
                    }}
                  />
                ))}
              </HStack>
            </HStack>
          </VStack>
        </BaseCard>
      </VStack>
    </Box>
  );
}
