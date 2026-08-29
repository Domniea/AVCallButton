"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Box, Flex, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  LuActivity,
  LuBriefcase,
  LuChevronLeft,
  LuChevronRight,
  LuGraduationCap,
  LuHotel,
  LuLandmark,
} from "react-icons/lu";

import { INDUSTRY_SLIDES, type IndustrySlide } from "../data/industries";

const INDUSTRY_ICONS = {
  education: LuGraduationCap,
  healthcare: LuActivity,
  corporate: LuBriefcase,
  hospitality: LuHotel,
  government: LuLandmark,
} as const;

function getOffset(index: number, activeIndex: number, count: number) {
  const diff = (index - activeIndex + count) % count;
  if (diff === 0) return 0;
  if (diff === 1) return 1;
  if (diff === count - 1) return -1;
  if (diff === 2) return 2;
  if (diff === count - 2) return -2;
  return 3;
}

function IndustryCard({
  slide,
  isActive,
}: {
  slide: IndustrySlide;
  isActive: boolean;
}) {
  const Icon = INDUSTRY_ICONS[slide.icon];

  return (
    <Box
      w="100%"
      h="100%"
      display="flex"
      flexDirection="column"
      borderRadius="xl"
      overflow="hidden"
      bg="surface"
      borderWidth="1px"
      borderColor={isActive ? "accent.500" : "whiteAlpha.200"}
      boxShadow={isActive ? "0 0 20px rgba(0,231,255,0.2)" : "md"}
      textAlign="left"
    >
      <Flex
        flex="1"
        minH={{ base: "148px", md: "168px" }}
        align="center"
        justify="center"
        px={{ base: 1.5, md: 2 }}
        pt={{ base: 1.5, md: 2 }}
        pb={1}
      >
        <Box
          position="relative"
          h="99%"
          w="100%"
          maxW="100%"
          aspectRatio="1"
          borderRadius="lg"
          overflow="hidden"
          bg="bgMuted"
          flexShrink={0}
        >
          <Image
            src={slide.imageSrc}
            alt={slide.label}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 45vw, 320px"
            style={{ objectFit: "cover" }}
          />
        </Box>
      </Flex>

      <VStack
        align="stretch"
        gap={0.5}
        px={{ base: 1.5, md: 2 }}
        py={{ base: 1, md: 1.5 }}
        flexShrink={0}
      >
        <HStack gap={2} align="center" minW={0}>
          <Flex
            w={6}
            h={6}
            borderRadius="full"
            bg="accent.500"
            color="primary.900"
            align="center"
            justify="center"
            flexShrink={0}
            fontSize="xs"
          >
            <Icon />
          </Flex>
          <Text fontSize="xs" fontWeight="bold" color="text" lineClamp={1}>
            {slide.label}
          </Text>
        </HStack>

        {isActive && (
          <>
            <Text fontSize="xs" color="textMuted" lineClamp={1}>
              {slide.description}
            </Text>
            <Text
              fontSize="xs"
              color="accent.500"
              fontWeight="semibold"
              alignSelf="flex-end"
            >
              Learn more →
            </Text>
          </>
        )}
      </VStack>
    </Box>
  );
}

function getCardMotion(offset: number) {
  const isCenter = offset === 0;
  const abs = Math.abs(offset);

  let x = "0%";
  if (offset === 1) x = "56%";
  else if (offset === -1) x = "-56%";
  else if (offset === 2) x = "98%";
  else if (offset === -2) x = "-98%";

  let rotateY = 0;
  if (offset === 1) rotateY = -26;
  else if (offset === -1) rotateY = 26;
  else if (offset === 2) rotateY = -34;
  else if (offset === -2) rotateY = 34;

  return {
    x,
    scale: isCenter ? 1 : abs === 1 ? 0.84 : 0.7,
    rotateY,
    opacity: isCenter ? 1 : abs === 1 ? 0.82 : 0.5,
    zIndex: isCenter ? 3 : abs === 1 ? 2 : 1,
  };
}

export default function IndustryRolodexSection() {
  const slides = INDUSTRY_SLIDES;
  const [slideIndex, setSlideIndex] = useState(1);
  const [mounted, setMounted] = useState(false);
  const count = slides.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  const go = (delta: number) => {
    if (count === 0) return;
    setSlideIndex((i) => (i + delta + count) % count);
  };

  if (count === 0) {
    return (
      <Box py={4}>
        <Text color="text" fontSize="sm">
          No industry slides configured.
        </Text>
      </Box>
    );
  }

  const activeSlide = slides[slideIndex];

  return (
    <VStack
      gap={{ base: 1.5, md: 2 }}
      w="100%"
      h="100%"
      maxH="100%"
      minH={0}
      overflow="hidden"
      justify="flex-end"
    >
      <VStack gap={1} textAlign="center" flexShrink={0}>
        <Text
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="widest"
          color="accent.500"
        >
          BUILT FOR EVERY INDUSTRY
        </Text>
        <Text
          fontSize={{ base: "lg", md: "xl" }}
          fontWeight="bold"
          color="text"
        >
          Trusted across every space
        </Text>
      </VStack>

      <Flex
        align="center"
        justify="center"
        w="100%"
        flexShrink={0}
        h={{ base: "252px", md: "288px" }}
        overflow="hidden"
        position="relative"
        perspective="1400px"
        px={{ base: 2, md: 4 }}
      >
        <IconButton
          aria-label="Previous industry"
          variant="ghost"
          size="sm"
          position="absolute"
          left={{ base: 0, md: 2 }}
          zIndex={10}
          borderRadius="full"
          bg="blackAlpha.700"
          borderWidth="1px"
          borderColor="whiteAlpha.300"
          color="text"
          onClick={() => go(-1)}
        >
          <LuChevronLeft />
        </IconButton>

        {!mounted && activeSlide ? (
          <Box position="absolute" w={{ base: "46%", md: "42%" }} h="100%">
            <IndustryCard slide={activeSlide} isActive />
          </Box>
        ) : (
          slides.map((slide, i) => {
            const offset = getOffset(i, slideIndex, count);
            if (Math.abs(offset) > 2) return null;

            const isActive = offset === 0;
            const motionProps = getCardMotion(offset);

            return (
              <motion.div
                key={slide.id}
                role="button"
                tabIndex={0}
                initial={false}
                onClick={() => setSlideIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSlideIndex(i);
                  }
                }}
                style={{
                  position: "absolute",
                  width: isActive ? "46%" : "38%",
                  height: isActive ? "100%" : "94%",
                  transformStyle: "preserve-3d",
                  cursor: "pointer",
                }}
                animate={motionProps}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
              >
                <IndustryCard slide={slide} isActive={isActive} />
              </motion.div>
            );
          })
        )}

        <IconButton
          aria-label="Next industry"
          variant="ghost"
          size="sm"
          position="absolute"
          right={{ base: 0, md: 2 }}
          zIndex={10}
          borderRadius="full"
          bg="blackAlpha.700"
          borderWidth="1px"
          borderColor="whiteAlpha.300"
          color="text"
          onClick={() => go(1)}
        >
          <LuChevronRight />
        </IconButton>
      </Flex>

      <Flex
        gap={2}
        justify="center"
        flexShrink={0}
        aria-label="Industry slide indicators"
      >
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Show ${s.label}`}
            aria-current={i === slideIndex ? "true" : undefined}
            onClick={() => setSlideIndex(i)}
            style={{
              width: i === slideIndex ? 18 : 8,
              height: 8,
              borderRadius: 9999,
              border: "none",
              padding: 0,
              cursor: "pointer",
              backgroundColor:
                i === slideIndex ? "#00E7FF" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </Flex>
    </VStack>
  );
}
