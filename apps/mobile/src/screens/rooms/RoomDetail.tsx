import React, { useCallback, useEffect, useState } from "react";
import { HStack, Text, VStack } from "native-base";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { fetchAuthSession } from "aws-amplify/auth";

import type { RootState, StoredFile } from "@av/store";
import { hasPermissionForRank, listRoomFiles } from "@av/store";

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
  formatFileSize,
  pickAndUploadRoomDocument,
  previewRoomDocument,
  shareRoomDocument,
} from "../../lib/roomDocuments";
import type { DashStackParamList } from "../../navigation/types";

type RoomDetailRoute = RouteProp<DashStackParamList, "roomDetail">;

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
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);
  const [sharingFileId, setSharingFileId] = useState<string | null>(null);

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

  const {
    roomCoverage,
    coverageActionError,
    removingCoverage,
    handleCoverageAssigned,
    handleRemoveCoverage,
  } = useEventCoverage(eventId, event);

  const loadFiles = useCallback(async () => {
    setFilesLoading(true);
    setFilesError(null);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) return;
      const { files: nextFiles } = await listRoomFiles(token, eventId, roomId);
      setFiles(nextFiles);
    } catch (err) {
      console.error("Failed to load room files:", err);
      setFilesError(documentsErrorMessage(err));
    } finally {
      setFilesLoading(false);
    }
  }, [eventId, roomId]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    void loadFiles();
  }, [authStatus, loadFiles]);

  const handleUpload = useCallback(async () => {
    setFilesError(null);
    setUploading(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) return;
      const uploaded = await pickAndUploadRoomDocument(token, eventId, roomId);
      if (uploaded) await loadFiles();
    } catch (err) {
      setFilesError(documentsErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }, [eventId, loadFiles, roomId]);

  const handlePreview = useCallback(
    async (fileId: string) => {
      setFilesError(null);
      setOpeningFileId(fileId);
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) return;
        await previewRoomDocument(token, eventId, roomId, fileId);
      } catch (err) {
        setFilesError(documentsErrorMessage(err));
      } finally {
        setOpeningFileId(null);
      }
    },
    [eventId, roomId],
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

  if (authStatus === "idle" || authStatus === "loading") {
    return <LoadingScreen message="Checking session…" />;
  }

  if (!event && eventsFetchStatus === "succeeded") {
    return <LoadingScreen message="Event not found" />;
  }

  if (!event) {
    return <LoadingScreen message="Loading event…" />;
  }

  const room = event.rooms.find((r) => r.id === roomId);
  if (!room) {
    return (
      <ScreenLayout title="Room not found" maxW="720">
        <Text fontSize="sm" color={muted}>
          This room may have been removed.
        </Text>
      </ScreenLayout>
    );
  }

  const zone = room.zoneId
    ? event.zones.find((z) => z.id === room.zoneId)
    : null;
  const roster = rosterMatchesEvent ? assignments : [];
  const roomTarget = { kind: "room" as const, id: room.id, name: room.name };
  const subtitle = zone
    ? `${event.name} · ${zone.name}`
    : `${event.name} · Unassigned`;

  return (
    <>
      <ScreenLayout title={room.name} subtitle={subtitle} maxW="720">
        {coverageActionError ? (
          <Text fontSize="sm" color="red.500">
            {coverageActionError}
          </Text>
        ) : null}

        <BaseCard title="Room details" titleAlign="start" variant="outline">
          <VStack space={3}>
            <DetailRow label="Room name" value={room.name} />
            <DetailRow label="Zone" value={zone?.name ?? "Unassigned"} />
          </VStack>
        </BaseCard>

        <BaseCard title="Guest help link" titleAlign="start" variant="outline">
          <RoomCallLinkActions
            roomName={room.name}
            callToken={room.callToken}
            eventName={event.name}
            zoneName={zone?.name}
          />
        </BaseCard>

        <BaseCard
          title="Documents & schematics"
          titleAlign="start"
          variant="outline"
        >
          <VStack space={3}>
            <Text fontSize="sm" color={muted}>
              Floor plans, rack diagrams, and other reference files for this
              room.
            </Text>

            {canUploadFiles ? (
              <BaseButton
                title={uploading ? "Uploading…" : "Upload file"}
                variety="tertiary"
                btnWidth="auto"
                isDisabled={uploading}
                onPress={() => void handleUpload()}
              />
            ) : null}

            {filesError ? (
              <Text fontSize="sm" color="red.500">
                {filesError}
              </Text>
            ) : null}

            {filesLoading ? (
              <Text fontSize="sm" color={muted}>
                Loading documents…
              </Text>
            ) : files.length === 0 ? (
              <Text fontSize="sm" color={muted}>
                No documents yet.
                {canUploadFiles ? " Upload a file to get started." : ""}
              </Text>
            ) : (
              <VStack space={2}>
                {files.map((file) => {
                  const meta = [formatFileSize(file.sizeBytes), file.contentType]
                    .filter(Boolean)
                    .join(" · ");
                  const isOpening = openingFileId === file.id;
                  const isSharing = sharingFileId === file.id;
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
                          title={isOpening ? "Opening…" : "Preview"}
                          variety="tertiary"
                          btnWidth="auto"
                          isDisabled={isOpening || isSharing}
                          onPress={() => void handlePreview(file.id)}
                        />
                        <BaseButton
                          title={isSharing ? "Saving…" : "Save / Share"}
                          variety="tertiary"
                          btnWidth="auto"
                          isDisabled={isOpening || isSharing}
                          onPress={() => void handleShare(file)}
                        />
                      </HStack>
                    </VStack>
                  );
                })}
              </VStack>
            )}
          </VStack>
        </BaseCard>

        <BaseCard variant="outline">
          <CoverageList
            rows={roomCoverage[room.id] ?? []}
            roster={roster}
            label="Room coverage"
            onAdd={() => setAssignCoverageModalOpen(true)}
            onRemove={(membershipId) =>
              void handleRemoveCoverage(roomTarget, membershipId)
            }
            removingMembershipId={removingMembershipIdFor(
              removingCoverage,
              "room",
              room.id,
            )}
          />
        </BaseCard>
      </ScreenLayout>

      <AssignCoverageModal
        isOpen={assignCoverageModalOpen}
        eventId={eventId}
        target={roomTarget}
        onClose={() => setAssignCoverageModalOpen(false)}
        onAssigned={handleCoverageAssigned}
      />
    </>
  );
}
