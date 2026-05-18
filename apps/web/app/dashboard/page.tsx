"use client";

import React, { useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  HStack,
  Grid,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import type { RootState, AppDispatch } from "@av/store";
import { fetchWorkspacesThunk, setActiveWorkspace } from "@av/store";
import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseCard } from "@/components/reusable/BaseCard";
import { workspaceDisplayName } from "@/lib/workspaceDisplayName";
import { logoutThunk } from "@av/store/src/auth";

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const user = useSelector((state: RootState) => state.auth.user);

  const workspaces = useSelector(
    (state: RootState) => state.workspace.workspaces,
  );
  const activeWorkspaceId = useSelector(
    (state: RootState) => state.workspace.activeWorkspaceId,
  );
  const fetchStatus = useSelector(
    (state: RootState) => state.workspace.fetchStatus,
  );
  const fetchError = useSelector(
    (state: RootState) => state.workspace.fetchError,
  );

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      void dispatch(fetchWorkspacesThunk());
    }
  }, [authStatus, dispatch]);

  const onLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      router.replace("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

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

  const activeWorkspace = workspaces.find(
    (w) => w.workspaceId === activeWorkspaceId,
  );

  return (
    <Box minHeight="100vh" bg="bg" px={6} py={10}>
      <VStack align="stretch" maxWidth="960px" mx="auto" gap={8}>
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "start", sm: "center" }}
          gap={4}
        >
          <VStack align="start" gap={1}>
            <Text fontSize="2xl" fontWeight="bold" color="text">
              Dashboard
            </Text>
            {user && (
              <Text fontSize="sm" color="gray.500">
                {user.email ?? user.id}
              </Text>
            )}
            {activeWorkspace && (
              <Text fontSize="xs" color="gray.500">
                Active workspace:{" "}
                <Text as="span" fontWeight="medium" color="text">
                  {workspaceDisplayName(activeWorkspace)}
                </Text>
              </Text>
            )}
          </VStack>
          <HStack flexWrap="wrap">
            <BaseButton variety="tertiary" onClick={() => router.push("/dashboard")}>
              Account
            </BaseButton>
            <BaseButton variety="secondary" onClick={onLogout}>
              Log out
            </BaseButton>
          </HStack>
        </Flex>

        {fetchStatus === "loading" && (
          <Text color="gray.500">Loading workspaces…</Text>
        )}

        {fetchStatus === "failed" && fetchError && (
          <BaseCard variant="outline" title="Something went wrong">
            <Text color="text" mb={4}>
              {fetchError}
            </Text>
            <BaseButton onClick={() => void dispatch(fetchWorkspacesThunk())}>
              Retry
            </BaseButton>
          </BaseCard>
        )}

        {fetchStatus !== "loading" &&
          fetchStatus !== "failed" &&
          workspaces.length === 0 && (
            <BaseCard title="No workspaces yet">
              <Text color="gray.500">
                When you join or create a workspace, it will show up here.
              </Text>
            </BaseCard>
          )}

        <Grid
          w="100%"
          gap={6}
          alignItems="stretch"
          templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
        >
          {workspaces.map((ws) => {
            const isActive = ws.workspaceId === activeWorkspaceId;
            return (
              <Box
                key={ws.workspaceId}
                as="button"
                textAlign="left"
                cursor="pointer"
                onClick={() => {
                  dispatch(setActiveWorkspace(ws.workspaceId));
                  router.push(`/workspace/${ws.workspaceId}`);
                }}
                borderWidth={isActive ? 2 : 0}
                borderColor={isActive ? "blue.500" : "transparent"}
                borderRadius="xl"
                transition="border-color 0.15s ease"
                minW={0}
                w="100%"
                h="100%"
                display="flex"
                flexDirection="column"
              >
                <BaseCard
                  title={workspaceDisplayName(ws)}
                  titleAlign="start"
                  variant="elevated"
                  flex="1"
                  minW={0}
                >
                  <HStack flexWrap="wrap" gap={2} mb={3}>
                    <Badge>{ws.type}</Badge>
                    {ws.role != null ? (
                      <Badge colorPalette="blue">{ws.role}</Badge>
                    ) : (
                      <Badge variant="outline">Role pending</Badge>
                    )}
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {ws.eventCount === 0
                      ? "No events yet"
                      : `${ws.eventCount} event${ws.eventCount === 1 ? "" : "s"}`}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={3}>
                    Open to view events and details
                  </Text>
                </BaseCard>
              </Box>
            );
          })}
        </Grid>
      </VStack>
    </Box>
  );
}
