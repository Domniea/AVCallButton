"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { Box, Text, Textarea, VStack } from "@chakra-ui/react";
import axios from "axios";

import { createHelpAlert, fetchCallMeta, type CallMeta } from "@av/store";

import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseCard } from "@/components/reusable/BaseCard";

const MESSAGE_MAX_LENGTH = 500;

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
        <Text color="gray.500">Loading…</Text>
      </PageShell>
    );
  }

  if (loadError || !meta) {
    return (
      <PageShell>
        <BaseCard>
          <VStack align="stretch" gap={3}>
            <Text fontSize="lg" fontWeight="semibold" color="text">
              Call link not available
            </Text>
            <Text color="gray.500">
              {loadError ?? "This link may be invalid or expired."}
            </Text>
          </VStack>
        </BaseCard>
      </PageShell>
    );
  }

  const locationLine = meta.zone
    ? `${meta.zone.name} · ${meta.room.name}`
    : meta.room.name;

  return (
    <PageShell>
      <BaseCard>
        <VStack align="stretch" gap={6}>
          <VStack align="stretch" gap={1}>
            <Text fontSize="sm" color="gray.500">
              {meta.event.name}
            </Text>
            <Text fontSize="xl" fontWeight="semibold" color="text">
              Need help?
            </Text>
            <Text fontSize="sm" color="text">
              {locationLine}
            </Text>
          </VStack>

          {!meta.acceptingCalls ? (
            <Box
              borderWidth={1}
              borderColor="cardBorder"
              borderRadius="md"
              px={4}
              py={3}
              bg="surface"
            >
              <Text color="text">
                This event is not accepting help requests right now.
              </Text>
            </Box>
          ) : didSend ? (
            <VStack align="stretch" gap={4}>
              <Box
                borderWidth={1}
                borderColor="cardBorder"
                borderRadius="md"
                px={4}
                py={3}
                bg="surface"
              >
                <Text fontWeight="medium" color="text">
                  Help is on the way
                </Text>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  AV staff have been notified.
                </Text>
              </Box>
              <BaseButton
                variety="secondary"
                title="Send another request"
                onClick={() => setDidSend(false)}
              />
            </VStack>
          ) : (
            <VStack align="stretch" gap={4}>
              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Optional message
                </Text>
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Describe what you need…"
                  rows={3}
                  maxLength={MESSAGE_MAX_LENGTH}
                  bg="surface"
                  borderColor="cardBorder"
                />
              </Box>

              {submitError ? (
                <Text fontSize="sm" color="red.500">
                  {submitError}
                </Text>
              ) : null}

              <BaseButton
                title={isSubmitting ? "Sending…" : "Request help"}
                disabled={isSubmitting}
                onClick={handleSubmit}
              />
            </VStack>
          )}
        </VStack>
      </BaseCard>
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <Box
      minH="100dvh"
      bg="bg"
      px={4}
      py={10}
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
    >
      <Box width="100%" maxW="420px">
        {children}
      </Box>
    </Box>
  );
}
