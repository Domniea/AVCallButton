"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { fetchAuthSession } from "aws-amplify/auth";

import type { AppDispatch, RootState } from "@av/store";
import { createRoom, createZone, fetchEventsThunk } from "@av/store";
import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseInput } from "@/components/reusable/BaseInput";
import { BaseModal } from "@/components/reusable/BaseModal";

type CreateZoneModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function RoomToggle({
  name,
  selected,
  onToggle,
}: {
  name: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      as="button"
      w="100%"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      gap={3}
      py={2}
      px={3}
      borderWidth={1}
      borderColor={selected ? "blue.400" : "cardBorder"}
      borderRadius="md"
      bg={selected ? "blue.50" : "surface"}
      _dark={{ bg: selected ? "whiteAlpha.100" : undefined }}
      onClick={onToggle}
      cursor="pointer"
    >
      <Text fontSize="sm" color="text" textAlign="left">
        {name}
      </Text>
      <Box
        w={4}
        h={4}
        borderWidth={2}
        borderColor={selected ? "blue.500" : "gray.400"}
        borderRadius="sm"
        bg={selected ? "blue.500" : "transparent"}
        flexShrink={0}
      />
    </Box>
  );
}

function apiErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "data" in err.response &&
    err.response.data &&
    typeof err.response.data === "object" &&
    "error" in err.response.data &&
    typeof err.response.data.error === "string"
  ) {
    return err.response.data.error;
  }
  return "Could not create zone. Try again.";
}

export default function CreateZoneModal({
  isOpen,
  onClose,
}: CreateZoneModalProps) {
  const { workspaceId, eventId } = useParams<{
    workspaceId: string;
    eventId: string;
  }>();
  const dispatch = useDispatch<AppDispatch>();
  const event = useSelector((state: RootState) =>
    state.events.events.find((e) => e.id === eventId),
  );

  const [zoneName, setZoneName] = useState("");
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomNames, setNewRoomNames] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unassignedRooms = useMemo(
    () => event?.rooms.filter((room) => room.zoneId == null) ?? [],
    [event?.rooms],
  );

  const resetForm = () => {
    setZoneName("");
    setSelectedRoomIds(new Set());
    setNewRoomName("");
    setNewRoomNames([]);
    setSubmitError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  const addNewRoomName = () => {
    const trimmed = newRoomName.trim();
    if (!trimmed) return;
    if (newRoomNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setSubmitError("That room name is already in your new rooms list.");
      return;
    }
    setNewRoomNames((prev) => [...prev, trimmed]);
    setNewRoomName("");
    setSubmitError(null);
  };

  const removeNewRoomName = (index: number) => {
    setNewRoomNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    const trimmedZoneName = zoneName.trim();
    const hasExisting = selectedRoomIds.size > 0;
    const hasNew = newRoomNames.length > 0;

    if (!trimmedZoneName && !hasExisting && !hasNew) {
      setSubmitError("Add a zone name, select rooms, or add new room names.");
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) {
        setSubmitError("Not signed in.");
        return;
      }

      const { zone } = await createZone(token, eventId, {
        name: trimmedZoneName || undefined,
        roomIds: hasExisting ? [...selectedRoomIds] : undefined,
      });

      for (const name of newRoomNames) {
        await createRoom(token, eventId, { name, zoneId: zone.id });
      }

      await dispatch(fetchEventsThunk(workspaceId));
      handleClose();
    } catch (err: unknown) {
      setSubmitError(apiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create zone"
      size="lg"
      scrollBehavior="inside"
      contentProps={{ maxH: "85vh" }}
    >
      <BaseModal.Body>
        <VStack align="stretch" gap={5}>
                <Text fontSize="sm" color="gray.500">
                  Create a new zone and organize rooms inside it.
                </Text>
                <BaseInput
                  label="Zone name"
                  placeholder="e.g. North Wing"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  helperText="Optional — defaults to Zone A, Zone B, etc."
                />

                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color="text" mb={2}>
                    Add existing rooms
                  </Text>
                  {unassignedRooms.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">
                      No unassigned rooms. Create new rooms below or add rooms
                      to the event first.
                    </Text>
                  ) : (
                    <VStack align="stretch" gap={2}>
                      {unassignedRooms.map((room) => (
                        <RoomToggle
                          key={room.id}
                          name={room.name}
                          selected={selectedRoomIds.has(room.id)}
                          onToggle={() => toggleRoom(room.id)}
                        />
                      ))}
                    </VStack>
                  )}
                </Box>

                <Box borderTopWidth="1px" borderTopColor="cardBorder" pt={4}>
                  <Text fontSize="sm" fontWeight="semibold" color="text" mb={2}>
                    Create new rooms for this zone
                  </Text>
                  <HStack align="flex-end" gap={2}>
                    <Box flex={1}>
                      <BaseInput
                        label="Room name"
                        placeholder="e.g. 150AB"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addNewRoomName();
                          }
                        }}
                      />
                    </Box>
                    <BaseButton
                      variety="secondary"
                      title="Add"
                      btnWidth="auto"
                      type="button"
                      onClick={addNewRoomName}
                    />
                  </HStack>

                  {newRoomNames.length > 0 && (
                    <VStack align="stretch" gap={2} mt={3}>
                      {newRoomNames.map((name, index) => (
                        <HStack
                          key={`${name}-${index}`}
                          justify="space-between"
                          py={2}
                          px={3}
                          borderWidth={1}
                          borderColor="cardBorder"
                          borderRadius="md"
                        >
                          <Text fontSize="sm" color="text">
                            {name}
                          </Text>
                          <BaseButton
                            variety="tertiary"
                            title="Remove"
                            btnWidth="auto"
                            type="button"
                            onClick={() => removeNewRoomName(index)}
                          />
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Box>

                {submitError ? (
                  <Text fontSize="sm" color="red.500">
                    {submitError}
                  </Text>
                ) : null}
        </VStack>
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseButton
          variety="tertiary"
          type="button"
          title="Cancel"
          onClick={handleClose}
        />
        <BaseButton
          variety="primary"
          type="button"
          title={isSubmitting ? "Creating…" : "Create zone"}
          onClick={() => void handleSubmit()}
        />
      </BaseModal.Footer>
    </BaseModal>
  );
}
