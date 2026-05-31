import React, { useEffect, useMemo, useState } from "react";
import {
  Modal as RNModal,
  Pressable as RNPressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import {
  Box,
  HStack,
  Text,
  VStack,
  Pressable,
  useColorModeValue,
} from "native-base";
import { useDispatch } from "react-redux";
import { fetchAuthSession } from "aws-amplify/auth";

import type { AppDispatch, EventRoom } from "@av/store";
import { createRoom, createZone, fetchEventsThunk } from "@av/store";

import { BaseButton } from "../components/BaseButton";
import { BaseInput } from "../components/BaseInput";

type CreateZoneModalProps = {
  isOpen: boolean;
  eventId: string;
  workspaceId: string;
  rooms: EventRoom[];
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
  const rowBorder = useColorModeValue("cardBorder", "cardBorderDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const textColor = useColorModeValue("text", "textDark");
  const selectedBorder = useColorModeValue("blue.400", "blue.300");
  const selectedBg = useColorModeValue("blue.50", "whiteAlpha.100");

  return (
    <Pressable
      onPress={onToggle}
      w="100%"
      py={2}
      px={3}
      borderWidth={1}
      borderColor={selected ? selectedBorder : rowBorder}
      borderRadius="md"
      bg={selected ? selectedBg : surface}
    >
      <HStack justifyContent="space-between" alignItems="center" space={3}>
        <Text fontSize="sm" color={textColor} flex={1}>
          {name}
        </Text>
        <Box
          w={4}
          h={4}
          borderWidth={2}
          borderColor={selected ? "blue.500" : "gray.400"}
          borderRadius="sm"
          bg={selected ? "blue.500" : "transparent"}
        />
      </HStack>
    </Pressable>
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
  eventId,
  workspaceId,
  rooms,
  onClose,
}: CreateZoneModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const textColor = useColorModeValue("text", "textDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const muted = useColorModeValue("muted", "mutedDark");
  const divider = useColorModeValue("cardBorder", "cardBorderDark");

  const [zoneName, setZoneName] = useState("");
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomNames, setNewRoomNames] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unassignedRooms = useMemo(
    () => rooms.filter((room) => room.zoneId == null),
    [rooms],
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
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.overlay}>
          <RNPressable style={styles.backdrop} onPress={handleClose} />
          <Box
            bg={surface}
            borderRadius="xl"
            mx={4}
            maxH="85%"
            w="100%"
            maxW="480"
            alignSelf="center"
            shadow="card"
            overflow="hidden"
          >
            <HStack
              justifyContent="space-between"
              alignItems="center"
              px={5}
              pt={5}
              pb={2}
            >
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                Create zone
              </Text>
              <RNPressable onPress={handleClose} hitSlop={12}>
                <Text fontSize="xl" color={muted}>
                  ×
                </Text>
              </RNPressable>
            </HStack>

            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text fontSize="sm" color={muted} mb={4}>
                Create a new zone and organize rooms inside it.
              </Text>

              <VStack space={5}>
                <BaseInput
                  label="Zone name"
                  placeholder="e.g. North Wing"
                  value={zoneName}
                  onChangeText={setZoneName}
                  helperText="Optional — defaults to Zone A, Zone B, etc."
                />

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={textColor}
                    mb={2}
                  >
                    Add existing rooms
                  </Text>
                  {unassignedRooms.length === 0 ? (
                    <Text fontSize="sm" color={muted}>
                      No unassigned rooms. Create new rooms below or add rooms
                      to the event first.
                    </Text>
                  ) : (
                    <VStack space={2}>
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

                <Box borderTopWidth={1} borderTopColor={divider} pt={4}>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={textColor}
                    mb={2}
                  >
                    Create new rooms for this zone
                  </Text>
                  <VStack space={2}>
                    <BaseInput
                      label="Room name"
                      placeholder="e.g. 150AB"
                      value={newRoomName}
                      onChangeText={setNewRoomName}
                      onSubmitEditing={addNewRoomName}
                    />
                    <BaseButton
                      title="Add"
                      variety="secondary"
                      btnWidth="auto"
                      onPress={addNewRoomName}
                    />
                  </VStack>

                  {newRoomNames.length > 0 && (
                    <VStack space={2} mt={3}>
                      {newRoomNames.map((name, index) => (
                        <HStack
                          key={`${name}-${index}`}
                          justifyContent="space-between"
                          alignItems="center"
                          py={2}
                          px={3}
                          borderWidth={1}
                          borderColor={divider}
                          borderRadius="md"
                          bg={surface}
                        >
                          <Text fontSize="sm" color={textColor} flex={1}>
                            {name}
                          </Text>
                          <BaseButton
                            title="Remove"
                            variety="tertiary"
                            btnWidth="auto"
                            onPress={() => removeNewRoomName(index)}
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
            </ScrollView>

            <HStack
              space={3}
              px={5}
              py={4}
              justifyContent="flex-end"
              borderTopWidth={1}
              borderTopColor={divider}
            >
              <BaseButton
                title="Cancel"
                variety="tertiary"
                btnWidth="auto"
                onPress={handleClose}
              />
              <BaseButton
                title={isSubmitting ? "Creating…" : "Create zone"}
                variety="primary"
                btnWidth="auto"
                onPress={() => void handleSubmit()}
              />
            </HStack>
          </Box>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
});
