"use client";

import React, { useEffect, useState } from "react";
import { Box, VStack, Text, HStack, Badge } from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";

import type { RootState, AppDispatch } from "@av/store";
import {
  fetchWorkspacesThunk,
  fetchEventsThunk,
  setActiveWorkspace,
} from "@av/store";
import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseCard } from "@/components/reusable/BaseCard";
import { workspaceDisplayName } from "@/lib/workspaceDisplayName";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { useViewMode } from "@/hooks/useViewMode";
import {
  canAccessAdminDash,
  resolveViewMode,
} from "@/lib/viewMode";
import Link from "next/link";
import CreateEventModal from "./modals/CreateEventModal";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { viewMode, setViewMode } = useViewMode();
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const workspaces = useSelector(
    (state: RootState) => state.workspace.workspaces,
  );
  const workspaceFetchStatus = useSelector(
    (state: RootState) => state.workspace.fetchStatus,
  );

  const eventsWorkspaceId = useSelector(
    (state: RootState) => state.events.workspaceId,
  );
  const events = useSelector((state: RootState) => state.events.events);
  const eventsFetchStatus = useSelector(
    (state: RootState) => state.events.fetchStatus,
  );
  const eventsFetchError = useSelector(
    (state: RootState) => state.events.fetchError,
  );

  const eventsMatchRoute =
    eventsWorkspaceId === workspaceId && eventsFetchStatus === "succeeded";

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (
      authStatus === "authenticated" &&
      workspaces.length === 0 &&
      workspaceFetchStatus === "idle"
    ) {
      void dispatch(fetchWorkspacesThunk());
    }
  }, [authStatus, workspaces.length, workspaceFetchStatus, dispatch]);

  useEffect(() => {
    if (!workspaceId) return;
    const ws = workspaces.find((w) => w.workspaceId === workspaceId);
    if (ws) {
      dispatch(setActiveWorkspace(workspaceId));
    }
  }, [workspaceId, workspaces, dispatch]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !workspaceId) return;
    void dispatch(fetchEventsThunk(workspaceId));
  }, [authStatus, workspaceId, dispatch]);

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <Box
        height="100vh"
        bg="bg"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.500">Checking session…</Text>
      </Box>
    );
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  const workspace = workspaces.find((w) => w.workspaceId === workspaceId);
  const canToggleAdmin = workspace
    ? canAccessAdminDash(workspace.roleRank)
    : false;
  const effectiveViewMode = workspace
    ? resolveViewMode(workspace.roleRank, viewMode)
    : "admin";

  const onSwitchToCrew = () => {
    setViewMode("crew");
    router.push(`/crew/workspace/${workspaceId}`);
  };

  if (workspaceFetchStatus === "loading" && workspaces.length === 0) {
    return (
      <Box minHeight="100vh" bg="bg" px={6} py={10}>
        <VStack align="stretch" maxWidth="720px" mx="auto" gap={6}>
          <Text color="gray.500">Loading workspace…</Text>
        </VStack>
      </Box>
    );
  }

  if (workspaceFetchStatus === "succeeded" && !workspace) {
    return (
      <Box minHeight="100vh" bg="bg" px={6} py={10}>
        <VStack align="stretch" maxWidth="720px" mx="auto" gap={6}>
          <BaseButton
            variety="tertiary"
            onClick={() => router.push("/dashboard")}
          >
            Back to dashboard
          </BaseButton>
          <BaseCard title="Workspace not found" variant="outline">
            <Text color="gray.500" mb={4}>
              You do not have access to this workspace, or the link is invalid.
            </Text>
            <BaseButton onClick={() => router.push("/dashboard")}>
              Back to dashboard
            </BaseButton>
          </BaseCard>
        </VStack>
      </Box>
    );
  }

  const canCreateShow = workspace ? canAccessAdminDash(workspace.roleRank) : false;

  return (
    <Box minHeight="100vh" bg="bg" px={6} py={10}>
      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
      />
      <VStack align="stretch" maxWidth="720px" mx="auto" gap={6}>
        {canToggleAdmin && (
          <ViewModeToggle
            viewMode={effectiveViewMode}
            onToggle={onSwitchToCrew}
          />
        )}

        <BaseCard
          title={workspace ? workspaceDisplayName(workspace) : "Workspace"}
          titleAlign="start"
          variant="elevated"
        >
          {workspace && (
            <HStack flexWrap="wrap" gap={2} mb={4}>
              <Badge>{workspace.type}</Badge>
              {workspace.role != null ? (
                <Badge colorPalette="blue">{workspace.role}</Badge>
              ) : (
                <Badge variant="outline">Role pending</Badge>
              )}
              <Text fontSize="sm" color="gray.500">
                {workspace.eventCount} event
                {workspace.eventCount === 1 ? "" : "s"}
              </Text>
            </HStack>
          )}

          <Text fontSize="sm" fontWeight="semibold" color="text" mb={2}>
            Events
          </Text>

          {canCreateShow && (
            <Box mb={3}>
              <BaseButton onClick={() => setIsCreateEventOpen(true)}>
                Create show
              </BaseButton>
            </Box>
          )}

          {eventsFetchStatus === "loading" && (
            <Text fontSize="sm" color="gray.500">
              Loading events…
            </Text>
          )}

          {eventsFetchStatus === "failed" && eventsFetchError && (
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color="gray.500">
                {eventsFetchError}
              </Text>
              <BaseButton
                variety="tertiary"
                onClick={() => void dispatch(fetchEventsThunk(workspaceId))}
              >
                Retry
              </BaseButton>
            </VStack>
          )}

          {eventsMatchRoute && events.length === 0 && (
            <Text fontSize="sm" color="gray.500">
              No events yet.
            </Text>
          )}

          {eventsMatchRoute && events.length > 0 && (
            <VStack align="stretch" gap={2}>
              {events.map((ev) => (
                <Link href={`/workspace/${workspaceId}/event/${ev.id}`} key={ev.id}>
                <Box
                  key={ev.id}
                  borderWidth={1}
                  borderColor="cardBorder"
                  borderRadius="md"
                  px={3}
                  py={2}
                >
                  <Text fontSize="sm" fontWeight="medium" color="text">
                    {ev.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {ev.status}
                    {ev.startTime
                      ? ` · ${new Date(ev.startTime).toLocaleString()}`
                      : ""}
                    {` · ${ev.zones.length} zone${ev.zones.length === 1 ? "" : "s"}`}
                    {` · ${ev.rooms.length} room${ev.rooms.length === 1 ? "" : "s"}`}
                  </Text>
                </Box>
                </Link>
              ))}
            </VStack>
          )}
        </BaseCard>
        <HStack pt={6} w='50%' justifyContent='center' mx='auto'>
          <BaseButton
            variety="tertiary"
            onClick={() => router.push("/dashboard")}
          >
            Back
          </BaseButton>
        </HStack>
      </VStack>
    </Box>
  );
}
