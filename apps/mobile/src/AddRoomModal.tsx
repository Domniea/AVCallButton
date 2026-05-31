import React from "react";
import {
  Modal as RNModal,
  Pressable as RNPressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Box, VStack, Text, HStack, Pressable, useColorModeValue } from "native-base";
import { useDispatch } from "react-redux";
import { fetchAuthSession } from "aws-amplify/auth";
import { Controller } from "react-hook-form";

import { useAppForm } from "@av/forms/src/useAppForm";
import {
  createRoomSchema,
  type CreateRoomSchema,
} from "@av/forms/src/schemas/rooms/createRoomSchema";
import type { AppDispatch, EventZone } from "@av/store";
import { createRoom, fetchEventsThunk } from "@av/store";

import { BaseInput } from "../components/BaseInput";
import { BaseButton } from "../components/BaseButton";

type AddRoomModalProps = {
  isOpen: boolean;
  eventId: string;
  workspaceId: string;
  zones: EventZone[];
  onClose: () => void;
};

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
  return "Could not create room. Try again.";
}

function ZoneOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const rowBorder = useColorModeValue("cardBorder", "cardBorderDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const textColor = useColorModeValue("text", "textDark");
  const selectedBorder = useColorModeValue("blue.400", "blue.300");
  const selectedBg = useColorModeValue("blue.50", "whiteAlpha.100");

  return (
    <Pressable
      onPress={onPress}
      py={2}
      px={3}
      borderWidth={1}
      borderColor={selected ? selectedBorder : rowBorder}
      borderRadius="md"
      bg={selected ? selectedBg : surface}
    >
      <Text fontSize="sm" color={textColor}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function AddRoomModal({
  isOpen,
  eventId,
  workspaceId,
  zones,
  onClose,
}: AddRoomModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const textColor = useColorModeValue("text", "textDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const muted = useColorModeValue("muted", "mutedDark");
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const form = useAppForm(createRoomSchema, {
    name: "",
    zoneId: "",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const handleClose = () => {
    setSubmitError(null);
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateRoomSchema) => {
    setSubmitError(null);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) {
        setSubmitError("Not signed in.");
        return;
      }

      const zoneId = data.zoneId?.trim();
      await createRoom(token, eventId, {
        name: data.name.trim(),
        ...(zoneId ? { zoneId } : {}),
      });

      await dispatch(fetchEventsThunk(workspaceId));
      handleClose();
    } catch (err: unknown) {
      setSubmitError(apiErrorMessage(err));
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
            p={5}
            maxW="400"
            w="100%"
            alignSelf="center"
            shadow="card"
          >
            <HStack justifyContent="space-between" alignItems="center" mb={2}>
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                Add room
              </Text>
              <RNPressable onPress={handleClose} hitSlop={12}>
                <Text fontSize="xl" color={muted}>
                  ×
                </Text>
              </RNPressable>
            </HStack>

            <Text fontSize="sm" color={muted} mb={4}>
              Add a single room. Optionally assign it to an existing zone.
            </Text>

            <VStack space={4}>
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState: { error } }) => (
                  <BaseInput
                    label="Room name"
                    placeholder="e.g. 150AB"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={error?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="zoneId"
                render={({ field }) => (
                  <VStack space={2}>
                    <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                      Zone (optional)
                    </Text>
                    <ZoneOption
                      label="Unassigned"
                      selected={!field.value}
                      onPress={() => field.onChange("")}
                    />
                    {zones.map((zone) => (
                      <ZoneOption
                        key={zone.id}
                        label={zone.name}
                        selected={field.value === zone.id}
                        onPress={() => field.onChange(zone.id)}
                      />
                    ))}
                    {zones.length === 0 ? (
                      <Text fontSize="xs" color={muted}>
                        No zones yet — room will be unassigned until you create
                        a zone.
                      </Text>
                    ) : null}
                  </VStack>
                )}
              />

              {submitError ? (
                <Text fontSize="sm" color="red.500">
                  {submitError}
                </Text>
              ) : null}
            </VStack>

            <HStack space={3} mt={6} justifyContent="flex-end">
              <BaseButton
                title="Cancel"
                variety="tertiary"
                btnWidth="auto"
                onPress={handleClose}
              />
              <BaseButton
                title={isSubmitting ? "Adding…" : "Add room"}
                variety="primary"
                btnWidth="auto"
                onPress={handleSubmit(onSubmit)}
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
