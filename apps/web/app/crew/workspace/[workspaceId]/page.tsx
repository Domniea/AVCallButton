"use client";

import React, { useEffect } from "react";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@av/store";
import {
  fetchMyWorkspaceEventsThunk,
  fetchWorkspacesThunk,
  setActiveWorkspace,
} from "@av/store";
import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseCard } from "@/components/reusable/BaseCard";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { useViewMode } from "@/hooks/useViewMode";
import { canAccessAdminDash, resolveViewMode } from "@/lib/viewMode";
import { workspaceDisplayName } from "@/lib/workspaceDisplayName";

function coverageLabel(zoneCount: number, roomCount: number): string {
  const parts: string[] = [];
  if (zoneCount > 0) {
    parts.push(`${zoneCount} zone${zoneCount === 1 ? "" : "s"}`);
  }
  if (roomCount > 0) {
    parts.push(`${roomCount} room${roomCount === 1 ? "" : "s"}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "No coverage assigned";
}

export default function CrewWorkspacePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { viewMode, setViewMode } = useViewMode();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const workspaces = useSelector(
    (state: RootState) => state.workspace.workspaces,
  );
  const workspaceFetchStatus = useSelector(
    (state: RootState) => state.workspace.fetchStatus,
  );
  const crewWorkspaceId = useSelector(
    (state: RootState) => state.crewDash.workspaceId,
  );
  const listEvents = useSelector((state: RootState) => state.crewDash.listEvents);
  const listStatus = useSelector(
    (state: RootState) => state.crewDash.listStatus,
  );
  const listError = useSelector(
    (state: RootState) => state.crewDash.listError,
  );

  const eventsMatchRoute =
    crewWorkspaceId === workspaceId && listStatus === "succeeded";

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/auth/login");
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
    const ws = workspaces.find((w) => w.workspaceId === workspaceId);
    if (ws) {
      dispatch(setActiveWorkspace(workspaceId));
    }
  }, [workspaceId, workspaces, dispatch]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !workspaceId) return;
    void dispatch(fetchMyWorkspaceEventsThunk(workspaceId));
  }, [authStatus, workspaceId, dispatch]);

  const workspace = workspaces.find((w) => w.workspaceId === workspaceId);
  const canToggleAdmin = workspace
    ? canAccessAdminDash(workspace.roleRank)
    : false;
  const effectiveViewMode = workspace
    ? resolveViewMode(workspace.roleRank, viewMode)
    : "crew";

  const onSwitchToAdmin = () => {
    setViewMode("admin");
    router.push(`/workspace/${workspaceId}`);
  };

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <Box minHeight="100vh" bg="bg" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">Checking session…</Text>
      </Box>
    );
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  if (workspaceFetchStatus === "loading" && workspaces.length === 0) {
    return (
      <Box minHeight="100vh" bg="bg" px={6} py={10}>
        <Text color="gray.500">Loading workspace…</Text>
      </Box>
    );
  }

  if (workspaceFetchStatus === "succeeded" && !workspace) {
    return (
      <Box minHeight="100vh" bg="bg" px={6} py={10}>
        <VStack align="stretch" maxW="720px" mx="auto" gap={4}>
          <BaseButton variety="tertiary" onClick={() => router.push("/dashboard")}>
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

  return (
    <Box minHeight="100vh" bg="bg" px={6} py={10}>
      <VStack align="stretch" maxW="720px" mx="auto" gap={4}>
        {canToggleAdmin && (
          <ViewModeToggle viewMode={effectiveViewMode} onToggle={onSwitchToAdmin} />
        )}

        <BaseCard
          title={workspace ? workspaceDisplayName(workspace) : "My events"}
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
            </HStack>
          )}

          <Text fontSize="sm" fontWeight="semibold" color="text" mb={2}>
            Your assigned events
          </Text>

          {listStatus === "loading" && (
            <Text fontSize="sm" color="gray.500">
              Loading your events…
            </Text>
          )}

          {listStatus === "failed" && listError && (
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color="gray.500">
                {listError}
              </Text>
              <BaseButton
                variety="tertiary"
                onClick={() =>
                  void dispatch(fetchMyWorkspaceEventsThunk(workspaceId))
                }
              >
                Retry
              </BaseButton>
            </VStack>
          )}

          {eventsMatchRoute && listEvents.length === 0 && (
            <Text fontSize="sm" color="gray.500">
              You are not assigned to any events in this workspace yet.
            </Text>
          )}

          {eventsMatchRoute && listEvents.length > 0 && (
            <VStack align="stretch" gap={2}>
              {listEvents.map(({ event, assignment, coverageSummary }) => (
                <Link
                  key={event.id}
                  href={`/crew/workspace/${workspaceId}/event/${event.id}`}
                >
                  <Box
                    borderWidth={1}
                    borderColor="cardBorder"
                    borderRadius="md"
                    px={3}
                    py={2}
                    _hover={{ bg: "blue.50" }}
                    _dark={{ _hover: { bg: "whiteAlpha.100" } }}
                  >
                    <Text fontSize="sm" fontWeight="medium" color="text">
                      {event.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {event.status}
                      {event.startTime
                        ? ` · ${new Date(event.startTime).toLocaleString()}`
                        : ""}
                    </Text>
                    <HStack gap={2} mt={2} flexWrap="wrap">
                      <Badge variant="outline">{assignment.roleName}</Badge>
                      <Badge variant="outline">
                        Rank {assignment.eventRank}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      {coverageLabel(
                        coverageSummary.zoneCount,
                        coverageSummary.roomCount,
                      )}
                    </Text>
                  </Box>
                </Link>
              ))}
            </VStack>
          )}
        </BaseCard>

        <BaseButton variety="tertiary" onClick={() => router.push("/dashboard")}>
          Back
        </BaseButton>
      </VStack>
    </Box>
  );
}
