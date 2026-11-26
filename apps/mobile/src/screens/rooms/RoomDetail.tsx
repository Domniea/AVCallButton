import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, ScrollView } from "react-native";
import { HStack, Text, VStack } from "../../../components/ui/layout";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { fetchAuthSession } from "aws-amplify/auth";

import type { AlertSummary, RootState, StoredFile } from "@av/store";
import {
  fetchRoomActiveAlerts,
  hasPermissionForRank,
  listRoomFiles,
  resolveEventAlert,
} from "@av/store";

import { BaseBottomSheet } from "../../../components/BaseBottomSheet";
import { BaseButton } from "../../../components/BaseButton";
import { BaseCard } from "../../../components/BaseCard";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { RoomCallLinkActions } from "../../../components/RoomCallLinkActions";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { useThemeColors } from "../../../hooks/useThemeColors";
import AssignCoverageModal from "../zones/AssignCoverageModal";
import { CoverageList, DetailRow } from "../../event/EventUi";
import { apiErrorMessage, removingMembershipIdFor } from "../../event/eventHelpers";
import { useEventCoverage } from "../../event/useEventCoverage";
import { useEventScreenData } from "../../event/useEventScreenData";
import {
  formatAlertAge,
  priorityLabel,
  severityAccent,
  severityFromPriority,
  severityLabel,
  severityPillVariant,
} from "../../event/alertBoardUi";
import {
  formatFileSize,
  pickAndUploadRoomDocument,
  previewRoomDocument,
  shareRoomDocument,
  type RoomDocumentSource,
} from "../../lib/roomDocuments";
import { refreshAlertBadgeCount } from "../../lib/alerts/alertBadgeCount";
import type { RoomDetailParams } from "../../navigation/types";
import { BasePill } from "../../../components/BasePill";

type RoomDetailRoute = RouteProp<{ roomDetail: RoomDetailParams }, "roomDetail">;

function documentsErrorMessage(err: unknown): string {
  const msg = apiErrorMessage(err);
  if (msg === "Could not update coverage. Try again.") {
    if (err instanceof Error && err.message) return err.message;
    return "Could not update documents. Try again.";
  }
  return msg;
}

export default function RoomDetailScreen() {
  const route = useRoute<RoomDetailRoute>();
  const { workspaceId, eventId, roomId } = route.params;
  const { muted, text, border } = useThemeColors();
  const [assignCoverageModalOpen, setAssignCoverageModalOpen] = useState(false);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [docsSheetOpen, setDocsSheetOpen] = useState(false);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);
  const [sharingFileId, setSharingFileId] = useState<string | null>(null);
  const filesLoadGenerationRef = useRef(0);
  const filesRoomIdRef = useRef(roomId);

  const [activeAlerts, setActiveAlerts] = useState<AlertSummary[]>([]);
  const [alertsRoom, setAlertsRoom] = useState<{
    id: string;
    name: string;
    zoneName: string | null;
    currentPriority: "HIGH" | "MEDIUM" | null;
  } | null>(null);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [alertsFocused, setAlertsFocused] = useState(false);

  const {
    authStatus,
    event,
    eventsFetchStatus,
    assignments,
    rosterMatchesEvent,
  } = useEventScreenData(workspaceId, eventId);

  const roleRank = useSelector((state: RootState) => {
    const ws = state.workspace.workspaces.find(
      (w) => w.workspaceId === workspaceId,
    );
    return ws?.roleRank ?? 0;
  });
  const canUploadFiles = hasPermissionForRank(roleRank, "event:update");

  const coverageScope = useMemo(
    () => ({ zoneIds: [] as string[], roomIds: [roomId] }),
    [roomId],
  );

  const {
    roomCoverage,
    coverageActionError,
    coverageLoadError,
    coverageLoading,
    loadCoverage,
    removingCoverage,
    handleCoverageAssigned,
    handleRemoveCoverage,
  } = useEventCoverage(eventId, event, coverageScope);

  useEffect(() => {
    if (filesRoomIdRef.current === roomId) return;
    filesRoomIdRef.current = roomId;
    filesLoadGenerationRef.current += 1;
    setFiles([]);
    setFilesError(null);
    setFilesLoading(true);
  }, [roomId]);

  const loadFiles = useCallback(async () => {
    const generation = ++filesLoadGenerationRef.current;
    setFilesLoading(true);
    setFilesError(null);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) {
        if (generation !== filesLoadGenerationRef.current) return;
        setFilesError("Not signed in.");
        return;
      }
      const { files: nextFiles } = await listRoomFiles(token, eventId, roomId);
      if (generation !== filesLoadGenerationRef.current) return;
      setFiles(nextFiles);
    } catch (err) {
      console.error("Failed to load room files:", err);
      if (generation !== filesLoadGenerationRef.current) return;
      setFilesError(documentsErrorMessage(err));
    } finally {
      if (generation === filesLoadGenerationRef.current) {
        setFilesLoading(false);
      }
    }
  }, [eventId, roomId]);

  const loadActiveAlerts = useCallback(async (opts?: { quiet?: boolean }) => {
    if (!opts?.quiet) {
      setAlertsLoading(true);
    }
    setAlertsError(null);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) {
        setAlertsError("Not signed in.");
        return;
      }
      const data = await fetchRoomActiveAlerts(token, eventId, roomId);
      setActiveAlerts(data.alerts);
      setAlertsRoom({
        id: data.room.id,
        name: data.room.name,
        zoneName: data.room.zoneName,
        currentPriority: data.room.currentPriority,
      });
    } catch (err) {
      console.error("Failed to load room alerts:", err);
      setAlertsError(apiErrorMessage(err));
    } finally {
      setAlertsLoading(false);
    }
  }, [eventId, roomId]);

  const handleResolveAlert = useCallback(
    async (alertId: string) => {
      setAlertsError(null);

      const previousAlerts = activeAlerts;
      const previousRoom = alertsRoom;
      const remaining = activeAlerts.filter((alert) => alert.id !== alertId);
      const optimisticPriority = remaining.some((a) => a.priority === "HIGH")
        ? ("HIGH" as const)
        : remaining.some((a) => a.priority === "MEDIUM")
          ? ("MEDIUM" as const)
          : null;

      // Drop immediately; confirm with API in the background.
      setActiveAlerts(remaining);
      setAlertsRoom((prev) =>
        prev ? { ...prev, currentPriority: optimisticPriority } : prev,
      );
      setResolvingAlertId(alertId);

      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) {
          setActiveAlerts(previousAlerts);
          setAlertsRoom(previousRoom);
          setAlertsError("Not signed in.");
          return;
        }
        const result = await resolveEventAlert(token, eventId, alertId);
        setAlertsRoom((prev) =>
          prev
            ? { ...prev, currentPriority: result.room.currentPriority }
            : prev,
        );
        void refreshAlertBadgeCount(eventId);
      } catch (err) {
        console.error("Failed to resolve alert:", err);
        setActiveAlerts(previousAlerts);
        setAlertsRoom(previousRoom);
        setAlertsError(apiErrorMessage(err));
      } finally {
        setResolvingAlertId(null);
      }
    },
    [activeAlerts, alertsRoom, eventId],
  );

  useFocusEffect(
    useCallback(() => {
      if (authStatus !== "authenticated") {
        setAlertsFocused(false);
        return;
      }
      setAlertsFocused(true);
      void loadFiles();
      void loadActiveAlerts();
      return () => setAlertsFocused(false);
    }, [authStatus, loadFiles, loadActiveAlerts]),
  );

  useEffect(() => {
    if (authStatus !== "authenticated" || !alertsFocused) return;

    const poll = setInterval(() => {
      void loadActiveAlerts({ quiet: true });
    }, 5_000);

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void loadActiveAlerts({ quiet: true });
      }
    });
    return () => {
      clearInterval(poll);
      if (sub && typeof sub.remove === "function") {
        sub.remove();
      }
    };
  }, [authStatus, alertsFocused, loadActiveAlerts]);

  const handleUpload = useCallback(
    async (source: RoomDocumentSource) => {
      setUploadSheetOpen(false);
      setFilesError(null);
      // Let the action sheet finish dismissing before presenting a system picker.
      await new Promise((resolve) => setTimeout(resolve, 300));
      setUploading(true);
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) return;
        const uploaded = await pickAndUploadRoomDocument(
          token,
          eventId,
          roomId,
          source,
        );
        if (uploaded) await loadFiles();
      } catch (err) {
        setFilesError(documentsErrorMessage(err));
      } finally {
        setUploading(false);
      }
    },
    [eventId, loadFiles, roomId],
  );

  const handlePreview = useCallback(
    async (fileId: string) => {
      setDocsSheetOpen(false);
      setFilesError(null);
      // Let the sheet dismiss before presenting Quick Look / the system viewer.
      await new Promise((resolve) => setTimeout(resolve, 300));
      setOpeningFileId(fileId);
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) return;
        await previewRoomDocument(token, eventId, roomId, fileId, files);
      } catch (err) {
        setFilesError(documentsErrorMessage(err));
      } finally {
        setOpeningFileId(null);
      }
    },
    [eventId, files, roomId],
  );

  const handleShare = useCallback(
    async (file: StoredFile) => {
      setFilesError(null);
      setSharingFileId(file.id);
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) return;
        await shareRoomDocument(
          token,
          eventId,
          roomId,
          file.id,
          file.originalName,
          file.contentType,
        );
      } catch (err) {
        setFilesError(documentsErrorMessage(err));
      } finally {
        setSharingFileId(null);
      }
    },
    [eventId, roomId],
  );

  const documentsSummary = useMemo(() => {
    if (filesLoading && files.length === 0) return "Loading documents…";
    if (files.length === 0) return "No documents yet.";
    return `${files.length} file${files.length === 1 ? "" : "s"} in this room packet.`;
  }, [files.length, filesLoading]);

  if (authStatus === "idle" || authStatus === "loading") {
    return <LoadingScreen message="Checking session…" />;
  }

  const roomFromEvent = event?.rooms.find((r) => r.id === roomId) ?? null;
  const zoneFromEvent = roomFromEvent?.zoneId
    ? event?.zones.find((z) => z.id === roomFromEvent.zoneId)
    : null;

  const roomName = roomFromEvent?.name ?? alertsRoom?.name ?? null;
  const zoneName =
    zoneFromEvent?.name ?? alertsRoom?.zoneName ?? null;
  const roomPriority = alertsRoom?.currentPriority ?? null;

  if (!event && eventsFetchStatus === "loading") {
    return <LoadingScreen message="Loading event…" />;
  }

  if (!roomName && alertsLoading) {
    return <LoadingScreen message="Loading room…" />;
  }

  if (!roomName) {
    return (
      <ScreenLayout title="Room not found" maxW="720">
        <Text fontSize="sm" color={muted}>
          This room may have been removed.
        </Text>
      </ScreenLayout>
    );
  }

  const roster = rosterMatchesEvent ? assignments : [];
  const roomTarget = {
    kind: "room" as const,
    id: roomId,
    name: roomName,
  };
  const subtitle = [
    event?.name,
    zoneName ?? (roomFromEvent ? "Unassigned" : null),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <ScreenLayout title={roomName} subtitle={subtitle || undefined} maxW="720">
        {coverageActionError ? (
          <Text fontSize="sm" color="red.500">
            {coverageActionError}
          </Text>
        ) : null}

        {coverageLoadError ? (
          <VStack space={2}>
            <Text fontSize="sm" color="red.500">
              {coverageLoadError}
            </Text>
            <BaseButton
              title="Retry coverage"
              variety="tertiary"
              btnWidth="auto"
              onPress={() => void loadCoverage()}
            />
          </VStack>
        ) : null}

        <BaseCard title="Room details" titleAlign="start" variant="outline">
          <VStack space={3}>
            <DetailRow label="Room name" value={roomName} />
            <DetailRow label="Zone" value={zoneName ?? "Unassigned"} />
            <HStack space={2} alignItems="center" flexWrap="wrap">
              <Text fontSize="xs" color={muted}>
                Alert status
              </Text>
              <BasePill
                label={severityLabel(severityFromPriority(roomPriority))}
                variant={severityPillVariant(
                  severityFromPriority(roomPriority),
                )}
              />
            </HStack>
          </VStack>
        </BaseCard>

        <BaseCard title="Active alerts" titleAlign="start" variant="outline">
          <VStack space={3}>
            {alertsLoading && activeAlerts.length === 0 ? (
              <Text fontSize="sm" color={muted}>
                Loading alerts…
              </Text>
            ) : null}

            {alertsError ? (
              <VStack space={2}>
                <Text fontSize="sm" color="red.500">
                  {alertsError}
                </Text>
                <BaseButton
                  title="Retry alerts"
                  variety="tertiary"
                  btnWidth="auto"
                  onPress={() => void loadActiveAlerts()}
                />
              </VStack>
            ) : null}

            {!alertsLoading && !alertsError && activeAlerts.length === 0 ? (
              <Text fontSize="sm" color={muted}>
                No active requests. Room is clear.
              </Text>
            ) : null}

            {activeAlerts.map((alert) => {
              const severity = severityFromPriority(alert.priority);
              const age = formatAlertAge(alert.createdAt);
              return (
                <VStack
                  key={alert.id}
                  space={2}
                  borderWidth={1}
                  borderColor={border}
                  borderRadius="md"
                  px={3}
                  py={3}
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: severityAccent(severity),
                  }}
                >
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    space={2}
                  >
                    <BasePill
                      label={priorityLabel(alert.priority)}
                      variant={severityPillVariant(severity)}
                    />
                    {age ? (
                      <Text fontSize="xs" color={muted}>
                        {age}
                      </Text>
                    ) : null}
                  </HStack>
                  <Text fontSize="sm" color={text}>
                    {alert.message?.trim() || "No message provided"}
                  </Text>
                  <BaseButton
                    title={
                      resolvingAlertId === alert.id ? "Resolving…" : "Resolve"
                    }
                    variety="secondary"
                    btnWidth="auto"
                    isDisabled={resolvingAlertId !== null}
                    onPress={() => void handleResolveAlert(alert.id)}
                  />
                </VStack>
              );
            })}
          </VStack>
        </BaseCard>

        {roomFromEvent?.callToken ? (
          <BaseCard title="Guest help link" titleAlign="start" variant="outline">
            <RoomCallLinkActions
              roomName={roomName}
              callToken={roomFromEvent.callToken}
              eventName={event?.name ?? "Event"}
              zoneName={zoneName ?? undefined}
            />
          </BaseCard>
        ) : null}

        <BaseCard
          title="Documents & schematics"
          titleAlign="start"
          variant="outline"
        >
          <VStack space={3}>
            <Text fontSize="sm" color={muted}>
              Floor plans, rack diagrams, and other reference files for this
              room. Open the packet to browse or preview files in-app.
            </Text>

            <Text fontSize="sm" color={text}>
              {documentsSummary}
              {files.length === 0 && canUploadFiles && !filesLoading
                ? " Upload a file to get started."
                : ""}
            </Text>

            {filesError ? (
              <VStack space={2}>
                <Text fontSize="sm" color="red.500">
                  {filesError}
                </Text>
                <BaseButton
                  title="Retry"
                  variety="tertiary"
                  btnWidth="auto"
                  onPress={() => void loadFiles()}
                />
              </VStack>
            ) : null}

            <HStack space={2} flexWrap="wrap">
              {files.length > 0 ? (
                <BaseButton
                  title={
                    openingFileId
                      ? "Opening…"
                      : `View packet (${files.length})`
                  }
                  variety="tertiary"
                  btnWidth="auto"
                  isDisabled={Boolean(openingFileId) || uploading}
                  onPress={() => setDocsSheetOpen(true)}
                />
              ) : null}
              {canUploadFiles ? (
                <BaseButton
                  title={uploading ? "Uploading…" : "Upload"}
                  variety="tertiary"
                  btnWidth="auto"
                  isDisabled={uploading || Boolean(openingFileId)}
                  onPress={() => setUploadSheetOpen(true)}
                />
              ) : null}
            </HStack>
          </VStack>
        </BaseCard>

        <BaseCard variant="outline">
          {coverageLoading && (roomCoverage[roomId] ?? []).length === 0 ? (
            <VStack space={2}>
              <Text fontSize="sm" fontWeight="semibold" color={text}>
                Room coverage
              </Text>
              <Text fontSize="sm" color={muted}>
                Loading coverage…
              </Text>
            </VStack>
          ) : (
            <CoverageList
              rows={roomCoverage[roomId] ?? []}
              roster={roster}
              label="Room coverage"
              onAdd={() => setAssignCoverageModalOpen(true)}
              onRemove={(membershipId) =>
                void handleRemoveCoverage(roomTarget, membershipId)
              }
              removingMembershipId={removingMembershipIdFor(
                removingCoverage,
                "room",
                roomId,
              )}
            />
          )}
        </BaseCard>
      </ScreenLayout>

      <AssignCoverageModal
        isOpen={assignCoverageModalOpen}
        eventId={eventId}
        target={roomTarget}
        onClose={() => setAssignCoverageModalOpen(false)}
        onAssigned={handleCoverageAssigned}
      />

      <BaseBottomSheet
        isOpen={uploadSheetOpen}
        onClose={() => setUploadSheetOpen(false)}
        title="Add document"
        items={[
          {
            key: "camera",
            label: "Take photo",
            isDisabled: uploading,
            onPress: () => {
              void handleUpload("camera");
            },
          },
          {
            key: "library",
            label: "Photo library",
            isDisabled: uploading,
            onPress: () => {
              void handleUpload("library");
            },
          },
          {
            key: "files",
            label: "Browse files",
            isDisabled: uploading,
            onPress: () => {
              void handleUpload("files");
            },
          },
        ]}
      />

      <BaseBottomSheet
        isOpen={docsSheetOpen}
        onClose={() => setDocsSheetOpen(false)}
        title={`Room packet · ${files.length}`}
        showCancel
        cancelLabel="Close"
      >
        <ScrollView
          style={{ width: "100%", maxHeight: 420 }}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          <VStack space={2} px={4} pb={2}>
            <Text fontSize="xs" color={muted} textAlign="center">
              Tap View to open in-app. On iPhone you can swipe between files in
              the packet.
            </Text>
            {files.map((file) => {
              const meta = [formatFileSize(file.sizeBytes), file.contentType]
                .filter(Boolean)
                .join(" · ");
              const isOpening = openingFileId === file.id;
              const isSharing = sharingFileId === file.id;
              const busy = Boolean(openingFileId) || Boolean(sharingFileId);
              return (
                <VStack
                  key={file.id}
                  space={2}
                  py={2}
                  px={3}
                  borderWidth={1}
                  borderColor={border}
                  borderRadius="md"
                >
                  <VStack space={0.5}>
                    <Text fontSize="sm" color={text} numberOfLines={2}>
                      {file.originalName}
                    </Text>
                    {meta ? (
                      <Text fontSize="xs" color={muted} numberOfLines={1}>
                        {meta}
                      </Text>
                    ) : null}
                  </VStack>
                  <HStack space={2} flexWrap="wrap">
                    <BaseButton
                      title={isOpening ? "Opening…" : "View"}
                      variety="tertiary"
                      btnWidth="auto"
                      isDisabled={busy}
                      onPress={() => void handlePreview(file.id)}
                    />
                    <BaseButton
                      title={isSharing ? "Saving…" : "Share"}
                      variety="tertiary"
                      btnWidth="auto"
                      isDisabled={busy}
                      onPress={() => void handleShare(file)}
                    />
                  </HStack>
                </VStack>
              );
            })}
          </VStack>
        </ScrollView>
      </BaseBottomSheet>
    </>
  );
}
