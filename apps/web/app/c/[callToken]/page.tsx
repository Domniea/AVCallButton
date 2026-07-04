"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  HStack,
  Spinner,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";

import { createHelpAlert, fetchCallMeta, type CallMeta } from "@av/store";

import { BaseButton } from "@/components/reusable/BaseButton";

const MESSAGE_MAX_LENGTH = 500;

const SAFE_TOP = "max(12px, env(safe-area-inset-top))";
const SAFE_BOTTOM = "max(16px, env(safe-area-inset-bottom))";
const SAFE_X = "max(16px, env(safe-area-inset-left))";

function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error;
    if (typeof message === "string" && message.length > 0) return message;
    if (error.response?.status === 429) {
      return "Too many help requests. Please wait a moment.";
    }
  }
  return "Something went wrong. Please try again.";
}

export default function GuestCallPage() {
  const params = useParams<{ callToken: string }>();
  const callToken = params.callToken?.trim() ?? "";

  const [meta, setMeta] = useState<CallMeta | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didSend, setDidSend] = useState(false);

  useEffect(() => {
    if (!callToken) {
      setLoadError("Invalid call link");
      setIsLoadingMeta(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoadingMeta(true);
      setLoadError(null);
      try {
        const data = await fetchCallMeta(callToken);
        if (!cancelled) setMeta(data);
      } catch (error) {
        if (!cancelled) setLoadError(parseApiError(error));
      } finally {
        if (!cancelled) setIsLoadingMeta(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [callToken]);

  const handleSubmit = useCallback(async () => {
    if (!callToken || !meta?.acceptingCalls) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createHelpAlert(callToken, {
        message: message.trim() || undefined,
      });
      setDidSend(true);
      setMessage("");
    } catch (error) {
      setSubmitError(parseApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [callToken, message, meta?.acceptingCalls]);

  if (isLoadingMeta) {
    return (
      <PageShell>
        <VStack gap={4} py={12} flex={1} justify="center">
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="md" color="gray.500">
            Loading room info…
          </Text>
        </VStack>
      </PageShell>
    );
  }

  if (loadError || !meta) {
    return (
      <PageShell>
        <VStack align="stretch" gap={5} py={6} flex={1} justify="center">
          <StatusIcon tone="error">!</StatusIcon>
          <VStack gap={2} textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="text">
              Link unavailable
            </Text>
            <Text fontSize="md" color="gray.500" lineHeight="tall" px={2}>
              {loadError ?? "This link may be invalid or expired."}
            </Text>
          </VStack>
        </VStack>
      </PageShell>
    );
  }

  const showForm = meta.acceptingCalls && !didSend;

  return (
    <PageShell
      footer={
        showForm ? (
          <MobileActionBar>
            {submitError ? (
              <NoticePanel tone="error">
                <Text fontSize="sm" color="red.500">
                  {submitError}
                </Text>
              </NoticePanel>
            ) : null}
            <BaseButton
              btnHeight="60px"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              <Text fontSize={{ base: "xl", md: "lg" }} fontWeight="bold">
                {isSubmitting ? "Sending…" : "Request help"}
              </Text>
            </BaseButton>
          </MobileActionBar>
        ) : undefined
      }
    >
      <VStack align="stretch" gap={6} flex={1} w="full" pb={showForm ? 4 : 0}>
        <LocationHero meta={meta} />

        {!meta.acceptingCalls ? (
          <NoticePanel tone="warning">
            <Text fontWeight="semibold" color="text" fontSize="md">
              Not accepting requests
            </Text>
            <Text fontSize="md" color="gray.500" mt={2} lineHeight="tall">
              This event is not taking help requests right now. Please contact
              staff directly if you need assistance.
            </Text>
          </NoticePanel>
        ) : didSend ? (
          <VStack align="stretch" gap={5}>
            <NoticePanel tone="success">
              <VStack align="center" gap={4} textAlign="center" py={2}>
                <StatusIcon tone="success" size="lg">
                  ✓
                </StatusIcon>
                <VStack gap={2}>
                  <Text fontWeight="bold" color="text" fontSize="2xl">
                    Help is on the way
                  </Text>
                  <Text fontSize="md" color="gray.500" lineHeight="tall">
                    AV staff have been notified for{" "}
                    <Text as="span" fontWeight="semibold" color="text">
                      {meta.room.name}
                    </Text>
                    .
                  </Text>
                </VStack>
              </VStack>
            </NoticePanel>
            <BaseButton
              variety="secondary"
              btnHeight="52px"
              title="Send another request"
              onClick={() => setDidSend(false)}
            />
          </VStack>
        ) : (
          <VStack align="stretch" gap={4}>
            <Text fontSize="md" color="gray.500" lineHeight="tall">
              Tap the button below and our crew will be notified right away.
            </Text>

            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="md" fontWeight="medium" color="text">
                  Optional message
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {message.length}/{MESSAGE_MAX_LENGTH}
                </Text>
              </HStack>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="e.g. No sound from the projector…"
                rows={3}
                maxLength={MESSAGE_MAX_LENGTH}
                bg="surface"
                borderColor="cardBorder"
                borderRadius="xl"
                fontSize="16px"
                lineHeight="tall"
                py={3}
                px={4}
                minH="96px"
                resize="none"
                _focusVisible={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 2px var(--chakra-colors-blue-400)",
                }}
              />
            </Box>
          </VStack>
        )}
      </VStack>
    </PageShell>
  );
}

function LocationHero({ meta }: { meta: CallMeta }) {
  const contextLine = [meta.zone?.name, meta.event.name].filter(Boolean).join(" · ");

  return (
    <VStack align="stretch" gap={3} pt={{ base: 2, md: 0 }}>
      <Text
        fontSize="xs"
        fontWeight="semibold"
        letterSpacing="0.14em"
        textTransform="uppercase"
        color="blue.500"
      >
        You are in
      </Text>
      <Text
        fontSize={{ base: "3xl", md: "4xl" }}
        fontWeight="bold"
        color="text"
        lineHeight="shorter"
        wordBreak="break-word"
      >
        {meta.room.name}
      </Text>
      {contextLine ? (
        <Text fontSize="md" color="gray.500" lineHeight="snug">
          {contextLine}
        </Text>
      ) : null}
      <Text
        fontSize={{ base: "2xl", md: "3xl" }}
        fontWeight="bold"
        color="text"
        lineHeight="shorter"
        pt={2}
      >
        Need AV help?
      </Text>
    </VStack>
  );
}

function StatusIcon({
  tone,
  size = "md",
  children,
}: {
  tone: "success" | "error";
  size?: "md" | "lg";
  children: ReactNode;
}) {
  const colors =
    tone === "success"
      ? {
          bg: "green.100",
          color: "green.700",
          _dark: { bg: "green.900", color: "green.200" },
        }
      : {
          bg: "red.100",
          color: "red.700",
          _dark: { bg: "red.900", color: "red.200" },
        };

  const dimensions = size === "lg" ? { w: 16, h: 16, fontSize: "2xl" } : { w: 12, h: 12, fontSize: "xl" };

  return (
    <Box
      borderRadius="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="bold"
      flexShrink={0}
      mx="auto"
      {...dimensions}
      {...colors}
    >
      {children}
    </Box>
  );
}

function NoticePanel({
  tone,
  children,
}: {
  tone: "success" | "warning" | "error";
  children: ReactNode;
}) {
  const styles = {
    success: {
      bg: "green.50",
      borderColor: "green.200",
      _dark: { bg: "green.950", borderColor: "green.800" },
    },
    warning: {
      bg: "orange.50",
      borderColor: "orange.200",
      _dark: { bg: "orange.950", borderColor: "orange.800" },
    },
    error: {
      bg: "red.50",
      borderColor: "red.200",
      _dark: { bg: "red.950", borderColor: "red.800" },
    },
  }[tone];

  return (
    <Box borderWidth={1} borderRadius="2xl" px={5} py={5} {...styles}>
      {children}
    </Box>
  );
}

function MobileActionBar({ children }: { children: ReactNode }) {
  return (
    <Box
      position="sticky"
      bottom={0}
      left={0}
      right={0}
      zIndex={10}
      pt={4}
      pb={SAFE_BOTTOM}
      mt="auto"
      bg="bg"
      borderTopWidth={1}
      borderTopColor="cardBorder"
      mx={{ base: -4, md: 0 }}
      px={{ base: 4, md: 0 }}
      style={{
        paddingBottom: SAFE_BOTTOM,
        WebkitTapHighlightColor: "transparent",
      }}
      _before={{
        content: '""',
        position: "absolute",
        top: "-24px",
        left: 0,
        right: 0,
        height: "24px",
        bgGradient: "to-t",
        gradientFrom: "bg",
        gradientTo: "transparent",
        pointerEvents: "none",
      }}
    >
      <VStack align="stretch" gap={3} w="full">
        {children}
      </VStack>
    </Box>
  );
}

function PageShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Box
      minH="100svh"
      bg="bg"
      position="relative"
      overflowX="hidden"
      display="flex"
      flexDirection="column"
      px={SAFE_X}
      pt={SAFE_TOP}
      pb={footer ? 0 : SAFE_BOTTOM}
      style={{
        paddingTop: SAFE_TOP,
        paddingLeft: SAFE_X,
        paddingRight: SAFE_X,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <Box
        position="absolute"
        top="-20%"
        right="-40%"
        w="90%"
        h="40%"
        borderRadius="full"
        bg="blue.400"
        opacity={0.1}
        filter="blur(60px)"
        pointerEvents="none"
        display={{ base: "block", md: "block" }}
      />

      <Box
        w="full"
        maxW="480px"
        mx="auto"
        flex={1}
        display="flex"
        flexDirection="column"
        position="relative"
        zIndex={1}
      >
        <Text
          fontSize="xs"
          fontWeight="semibold"
          letterSpacing="0.12em"
          textTransform="uppercase"
          color="gray.500"
          textAlign="center"
          py={3}
          flexShrink={0}
        >
          AV Call Button
        </Text>

        <Box flex={1} display="flex" flexDirection="column" w="full">
          {children}
        </Box>

        {footer}

        {!footer ? (
          <Text
            fontSize="xs"
            color="gray.500"
            textAlign="center"
            py={4}
            flexShrink={0}
          >
            For technical assistance in this room only.
          </Text>
        ) : null}
      </Box>
    </Box>
  );
}
