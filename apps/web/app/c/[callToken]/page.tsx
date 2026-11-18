"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { Box, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import axios from "axios";

import {
  createHelpAlert,
  fetchCallMeta,
  type CallMeta,
  type HelpAlertPriority,
} from "@av/store";
import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { useAppForm } from "@av/forms/src/useAppForm";
import {
  GUEST_HELP_MESSAGE_MAX_LENGTH,
  guestHelpRequestSchema,
  type GuestHelpPriority,
  type GuestHelpRequestSchema,
} from "@av/forms/src/schemas/public/guestHelpRequestSchema";

import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseInput } from "@/components/reusable/BaseInput";

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

function confirmCopy(priority: HelpAlertPriority): {
  title: string;
  body: string;
} {
  if (priority === "HIGH") {
    return {
      title: "Help is on the way",
      body: "Staff were notified that you need help now",
    };
  }
  return {
    title: "Request sent",
    body: "Staff were notified to come by when available",
  };
}

export default function GuestCallPage() {
  const params = useParams<{ callToken: string }>();
  const callToken = params.callToken?.trim() ?? "";

  const [meta, setMeta] = useState<CallMeta | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  const [sentPriority, setSentPriority] = useState<HelpAlertPriority | null>(
    null,
  );

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

  return (
    <PageShell>
      <VStack align="stretch" gap={6} flex={1} w="full">
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
        ) : sentPriority ? (
          <VStack align="stretch" gap={5}>
            <NoticePanel tone="success">
              <VStack align="center" gap={4} textAlign="center" py={2}>
                <StatusIcon tone="success" size="lg">
                  ✓
                </StatusIcon>
                <VStack gap={2}>
                  <Text fontWeight="bold" color="text" fontSize="2xl">
                    {confirmCopy(sentPriority).title}
                  </Text>
                  <Text fontSize="md" color="gray.500" lineHeight="tall">
                    {confirmCopy(sentPriority).body} for{" "}
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
              onClick={() => setSentPriority(null)}
            />
          </VStack>
        ) : (
          <GuestHelpForm
            key="guest-help-form"
            callToken={callToken}
            onSent={(priority) => setSentPriority(priority)}
          />
        )}
      </VStack>
    </PageShell>
  );
}

function GuestHelpForm({
  callToken,
  onSent,
}: {
  callToken: string;
  onSent: (priority: GuestHelpPriority) => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittingPriority, setSubmittingPriority] =
    useState<GuestHelpPriority | null>(null);

  const form = useAppForm(guestHelpRequestSchema, { message: "" });
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = form;

  const messageLength = watch("message")?.length ?? 0;

  const submitWithPriority = (priority: GuestHelpPriority) =>
    handleSubmit(async (values: GuestHelpRequestSchema) => {
      setSubmitError(null);
      setSubmittingPriority(priority);
      try {
        await createHelpAlert(callToken, {
          message: values.message.trim() || undefined,
          priority,
        });
        onSent(priority);
      } catch (error) {
        setSubmitError(parseApiError(error));
      } finally {
        setSubmittingPriority(null);
      }
    })();

  return (
    <Box as="form" w="full" onSubmit={(e) => e.preventDefault()}>
      <VStack align="stretch" gap={4}>
        <Text fontSize="md" color="gray.500" lineHeight="tall">
          Choose how soon you need help. Add an optional message if it helps
          staff know what to bring.
        </Text>

        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="md" fontWeight="medium" color="text">
              Optional message
            </Text>
            <Text fontSize="sm" color="gray.500">
              {messageLength}/{GUEST_HELP_MESSAGE_MAX_LENGTH}
            </Text>
          </HStack>
          <RHFInput
            control={control}
            name="message"
            Component={BaseInput}
            componentProps={{
              placeholder: "e.g. No sound from the projector",
              type: "text",
              enterKeyHint: "done",
              autoComplete: "off",
              autoCorrect: "off",
              maxLength: GUEST_HELP_MESSAGE_MAX_LENGTH,
              fontSize: "16px",
              disabled: isSubmitting,
            }}
          />
        </Box>

        {submitError ? (
          <NoticePanel tone="error">
            <Text fontSize="sm" color="red.500">
              {submitError}
            </Text>
          </NoticePanel>
        ) : null}

        <VStack align="stretch" gap={3} pt={1}>
          <BaseButton
            type="button"
            btnHeight="60px"
            disabled={isSubmitting}
            onClick={() => void submitWithPriority("HIGH")}
          >
            <VStack gap={0}>
              <Text fontSize={{ base: "xl", md: "lg" }} fontWeight="bold">
                {submittingPriority === "HIGH" ? "Sending…" : "Need help now"}
              </Text>
              <Text fontSize="sm" opacity={0.85}>
                Urgent — staff notified immediately
              </Text>
            </VStack>
          </BaseButton>

          <BaseButton
            type="button"
            variety="secondary"
            btnHeight="60px"
            disabled={isSubmitting}
            onClick={() => void submitWithPriority("MEDIUM")}
          >
            <VStack gap={0}>
              <Text fontSize={{ base: "xl", md: "lg" }} fontWeight="bold">
                {submittingPriority === "MEDIUM"
                  ? "Sending…"
                  : "When available"}
              </Text>
              <Text fontSize="sm" opacity={0.8}>
                Less urgent — come by when free
              </Text>
            </VStack>
          </BaseButton>
        </VStack>
      </VStack>
    </Box>
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

function PageShell({ children }: { children: ReactNode }) {
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
      pb={SAFE_BOTTOM}
      style={{
        paddingTop: SAFE_TOP,
        paddingLeft: SAFE_X,
        paddingRight: SAFE_X,
        paddingBottom: SAFE_BOTTOM,
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

        <Text
          fontSize="xs"
          color="gray.500"
          textAlign="center"
          py={4}
          flexShrink={0}
        >
          For technical assistance in this room only.
        </Text>
      </Box>
    </Box>
  );
}
