"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import AssignStaffModal from "./AssignStaffModal";

import type { AppDispatch, RootState } from "@av/store";
import type { RosterAssignment, RosterPendingInvite } from "@av/store";
import { clearRoster, fetchEventsThunk, fetchRosterThunk } from "@av/store";
import { BaseCard } from "@/components/reusable/BaseCard";
import { BaseButton } from "@/components/reusable/BaseButton";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" mb={0.5}>
        {label}
      </Text>
      <Text fontSize="sm" color="text">
        {value}
      </Text>
    </Box>
  );
}

function StaffRow({
  email,
  subtitle,
  badge,
}: {
  email: string | null;
  subtitle?: string;
  badge: string;
}) {
  return (
    <HStack
      justify="space-between"
      align="center"
      gap={3}
      py={2}
      px={3}
      borderWidth={1}
      borderColor="cardBorder"
      borderRadius="md"
      bg="surface"
    >
      <Box minW={0} flex={1}>
        <Text fontSize="sm" color="text" truncate>
          {email ?? "—"}
        </Text>
        {subtitle ? (
          <Text fontSize="xs" color="gray.500">
            {subtitle}
          </Text>
        ) : null}
      </Box>
      <Badge size="sm" variant="subtle" flexShrink={0}>
        {badge}
      </Badge>
    </HStack>
  );
}

function assignmentSubtitle(a: RosterAssignment) {
  const parts = [a.roleName, `Event rank ${a.eventRank}`].filter(Boolean);
  return parts.join(" · ");
}

function pendingSubtitle(p: RosterPendingInvite) {
  const parts = [p.roleName, `Event rank ${p.eventRank}`].filter(Boolean);
  return parts.join(" · ");
}

export default function EventPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const eventId = params.eventId as string;
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);

  const authStatus = useSelector((state: RootState) => state.auth.status);

  const event = useSelector((state: RootState) =>
    state.events.events.find((e) => e.id === eventId),
  );
  const eventsFetchStatus = useSelector(
    (state: RootState) => state.events.fetchStatus,
  );

  const assignments = useSelector(
    (state: RootState) => state.roster.assignments,
  );

  const pendingInvites = useSelector(
    (state: RootState) => state.roster.pendingInvites,
  );

  const rosterEventId = useSelector((state: RootState) => state.roster.eventId);
  const rosterFetchStatus = useSelector(
    (state: RootState) => state.roster.fetchStatus,
  );
  const rosterFetchError = useSelector(
    (state: RootState) => state.roster.fetchError,
  );
  const rosterMatchesEvent =
    rosterEventId === eventId && rosterFetchStatus === "succeeded";

  const openAssignStaffModal = () => {
    setIsAssignStaffModalOpen(true);
  };
  const closeAssignStaffModal = () => {
    setIsAssignStaffModalOpen(false);
  };
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !workspaceId) return;
    if (eventsFetchStatus === "idle") {
      void dispatch(fetchEventsThunk(workspaceId));
    }
  }, [authStatus, workspaceId, eventsFetchStatus, dispatch]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !eventId) return;
    void dispatch(fetchRosterThunk(eventId));
    return () => {
      dispatch(clearRoster());
    };
  }, [authStatus, eventId, dispatch]);

  const loadingShell = (message: string) => (
    <Box minHeight="100vh" bg="bg" px={6} py={10}>
      <VStack align="stretch" maxW="840px" mx="auto" gap={6}>
        <Text color="gray.500">{message}</Text>
      </VStack>
    </Box>
  );

  if (authStatus === "idle" || authStatus === "loading") {
    return loadingShell("Loading…");
  }

  if (!event && eventsFetchStatus === "succeeded") {
    return loadingShell("Event not found");
  }

  if (!event) {
    return loadingShell("Loading event…");
  }

  const formattedStart = event.startTime
    ? new Date(event.startTime).toLocaleString()
    : null;
  const formattedEnd = event.endTime
    ? new Date(event.endTime).toLocaleString()
    : null;

  return (
    <Box minHeight="100vh" bg="bg" px={6} py={10}>
      <VStack align="stretch" maxW="840px" mx="auto" gap={6}>
        <AssignStaffModal
          isOpen={isAssignStaffModalOpen}
          onClose={closeAssignStaffModal}
        />
        <BaseCard title={event.name} titleAlign="start" variant="elevated">
          <HStack flexWrap="wrap" gap={2} mb={0}>
            <Badge textTransform="capitalize">{event.status}</Badge>
            {rosterMatchesEvent && (
              <Badge variant="outline" colorPalette="gray">
                {assignments.length} on roster
                {pendingInvites.length > 0
                  ? ` · ${pendingInvites.length} pending`
                  : ""}
              </Badge>
            )}
          </HStack>

          <Box
            w="80%"
            mx="auto"
            borderTopWidth="1px"
            borderTopColor="cardBorder"
            my={5}
            aria-hidden
          />

          <Box
            display="grid"
            gridTemplateColumns={{
              base: "1fr",
              md: "minmax(0, 1.15fr) minmax(0, 1fr)",
            }}
            columnGap={{ md: 8 }}
            rowGap={{ base: 6, md: 4 }}
            alignItems="start"
            justifyItems="stretch"
            w="100%"
          >
            <Box minW={0} alignSelf="start">
              <VStack align="stretch" gap={3}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="text"
                  lineHeight="1.25"
                  m={0}
                >
                  Event details
                </Text>
                <DetailRow label="Location" value={event.location} />
                <DetailRow label="Venue" value={event.venue} />
                <DetailRow label="Starts" value={formattedStart} />
                <DetailRow label="Ends" value={formattedEnd} />
                {!event.location &&
                  !event.venue &&
                  !formattedStart &&
                  !formattedEnd && (
                    <Text fontSize="sm" color="gray.500">
                      No location or schedule set yet.
                    </Text>
                  )}
              </VStack>
            </Box>

            <Box
              minW={0}
              alignSelf="start"
              borderLeftWidth={{ base: "0", md: "1px" }}
              borderTopWidth={{ base: "1px", md: "0" }}
              borderColor="cardBorder"
              pl={{ base: 0, md: 6 }}
              pt={{ base: 4, md: 0 }}
            >
              <VStack align="stretch" gap={3} justify="flex-start">
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="text"
                  lineHeight="1.25"
                  m={0}
                >
                  Staff
                </Text>

                {rosterFetchStatus === "loading" && (
                  <Text fontSize="sm" color="gray.500" m={0}>
                    Loading roster…
                  </Text>
                )}

                {rosterFetchStatus === "failed" && rosterFetchError && (
                  <Text fontSize="sm" color="red.500" m={0}>
                    {rosterFetchError}
                  </Text>
                )}

                {rosterMatchesEvent &&
                  assignments.length === 0 &&
                  pendingInvites.length === 0 && (
                    <Text fontSize="sm" color="gray.500" m={0}>
                      No staff on this event yet.
                    </Text>
                  )}

                {rosterMatchesEvent &&
                  (assignments.length > 0 || pendingInvites.length > 0) && (
                    <VStack align="stretch" gap={2}>
                      {assignments.map((a) => (
                        <StaffRow
                          key={a.id}
                          email={a.email}
                          subtitle={assignmentSubtitle(a)}
                          badge={a.role ?? "Assigned"}
                        />
                      ))}
                      {pendingInvites.map((p) => (
                        <StaffRow
                          key={p.id}
                          email={p.email}
                          subtitle={pendingSubtitle(p)}
                          badge="Pending"
                        />
                      ))}
                    </VStack>
                  )}

                <Box
                  borderTopWidth="1px"
                  borderTopColor="cardBorder"
                  pt={4}
                  mt={1}
                >
                  <BaseButton
                    title="Assign staff"
                    btnWidth="100%"
                    onClick={openAssignStaffModal}
                  />
                </Box>
              </VStack>
            </Box>
          </Box>
        </BaseCard>
        <HStack pt={6} w="50%" justifyContent="center" mx="auto">
          <BaseButton
            variety="tertiary"
            onClick={() => router.push(`/workspace/${workspaceId}`)}
          >
            Back
          </BaseButton>
        </HStack>
      </VStack>
    </Box>
  );
}
