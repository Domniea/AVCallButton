"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Box, Flex, IconButton, Text, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

import { PRODUCT_SLIDES } from "../data/productSlides";

function getOffset(index: number, activeIndex: number, count: number) {
  const diff = (index - activeIndex + count) % count;
  if (diff === 0) return 0;
  if (diff === 1) return 1;
  if (diff === count - 1) return -1;
  return 2;
}

function SlideFrame({
  slide,
  isCenter,
}: {
  slide: (typeof PRODUCT_SLIDES)[number];
  isCenter: boolean;
}) {
  return (
    <Box
      position="relative"
      w="100%"
      h="100%"
      borderRadius="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor={isCenter ? "accent.500" : "whiteAlpha.200"}
      boxShadow={isCenter ? "0 20px 50px rgba(0,0,0,0.45)" : "md"}
    >
      <Image
        src={slide.imageSrc}
        alt={slide.title}
        fill
        sizes="(max-width: 768px) 60vw, 520px"
        style={{ objectFit: "cover" }}
        priority={isCenter}
      />
    </Box>
  );
}

export default function HeroProductCarousel() {
  const slides = PRODUCT_SLIDES;
  const [index, setIndex] = useState(1);
  const [mounted, setMounted] = useState(false);
  const count = slides.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  const go = (delta: number) => {
    setIndex((i) => (i + delta + count) % count);
  };

  const activeSlide = slides[index];

  return (
    <VStack align="stretch" gap={3} h="100%" minH={0}>
      <Flex
        align="center"
        justify="center"
        position="relative"
        flex="1"
        minH={{ base: "180px", md: "220px", lg: "260px" }}
        maxH={{ base: "220px", md: "260px", lg: "280px" }}
        overflow="hidden"
        perspective="1200px"
      >
        <IconButton
          aria-label="Previous dashboard"
          variant="ghost"
          size="sm"
          position="absolute"
          left={0}
          zIndex={10}
          borderRadius="full"
          bg="whiteAlpha.100"
          color="text"
          onClick={() => go(-1)}
        >
          <LuChevronLeft />
        </IconButton>

        {!mounted ? (
          <Box
            position="absolute"
            w={{ base: "58%", md: "52%" }}
            aspectRatio="16/10"
          >
            {activeSlide ? (
              <SlideFrame slide={activeSlide} isCenter />
            ) : null}
          </Box>
        ) : (
          slides.map((slide, i) => {
            const offset = getOffset(i, index, count);
            if (Math.abs(offset) > 1) return null;

            const isCenter = offset === 0;

            return (
              <motion.div
                key={slide.id}
                initial={false}
                style={{
                  position: "absolute",
                  width: "52%",
                  aspectRatio: "16 / 10",
                  transformStyle: "preserve-3d",
                }}
                animate={{
                  x: offset === 0 ? "0%" : offset === -1 ? "-58%" : "58%",
                  scale: isCenter ? 1 : 0.82,
                  rotateY: offset === 0 ? 0 : offset === -1 ? 28 : -28,
                  opacity: isCenter ? 1 : 0.55,
                  zIndex: isCenter ? 3 : 2,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
              >
                <SlideFrame slide={slide} isCenter={isCenter} />
              </motion.div>
            );
          })
        )}

        <IconButton
          aria-label="Next dashboard"
          variant="ghost"
          size="sm"
          position="absolute"
          right={0}
          zIndex={10}
          borderRadius="full"
          bg="whiteAlpha.100"
          color="text"
          onClick={() => go(1)}
        >
          <LuChevronRight />
        </IconButton>
      </Flex>

      <VStack gap={1} textAlign="center" px={4}>
        <Text fontSize="sm" fontWeight="bold" color="text">
          {activeSlide?.title}
        </Text>
        <Text fontSize="xs" color="textMuted" maxW="md">
          {activeSlide?.description}
        </Text>
        <Text fontSize="xs" color="accent.500" fontWeight="semibold">
          Learn more →
        </Text>
      </VStack>
    </VStack>
  );
}
