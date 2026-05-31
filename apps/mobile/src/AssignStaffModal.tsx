import React from "react";
import {
  Modal as RNModal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Box, VStack, Text, HStack, useColorModeValue } from "native-base";
import { useDispatch } from "react-redux";
import type { z } from "zod";

import { useAppForm } from "@av/forms/src/useAppForm";
import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { assignStaffSchema } from "@av/forms/src/schemas/roster/assignStaffSchema";
import type { AppDispatch, AssignStaffData } from "@av/store";
import { assignStaffThunk, fetchRosterThunk } from "@av/store";

import { BaseInput } from "../components/BaseInput";
import { BaseButton } from "../components/BaseButton";

type AssignStaffModalProps = {
  isOpen: boolean;
  eventId: string;
  onClose: () => void;
};

export default function AssignStaffModal({
  isOpen,
  eventId,
  onClose,
}: AssignStaffModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const textColor = useColorModeValue("text", "textDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const muted = useColorModeValue("muted", "mutedDark");
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const form = useAppForm(assignStaffSchema, {
    email: "",
    eventRank: 0,
    workspaceRoleRank: 0,
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

  const onSubmit = async (data: z.infer<typeof assignStaffSchema>) => {
    setSubmitError(null);
    const payload: AssignStaffData = {
      email: data.email,
      eventRank: data.eventRank,
    };
    if (data.workspaceRoleRank != null && data.workspaceRoleRank > 0) {
      payload.workspaceRoleRank = data.workspaceRoleRank;
    }

    try {
      await dispatch(assignStaffThunk({ eventId, data: payload })).unwrap();
      await dispatch(fetchRosterThunk(eventId)).unwrap();
      handleClose();
    } catch (err) {
      setSubmitError(
        typeof err === "string" ? err : "Could not assign staff. Try again.",
      );
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
          <Pressable style={styles.backdrop} onPress={handleClose} />
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
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Assign staff
            </Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Text fontSize="xl" color={muted}>
                ×
              </Text>
            </Pressable>
          </HStack>

          <VStack space={4}>
            <RHFInput
              control={control}
              name="email"
              label="Email"
              Component={BaseInput}
              componentProps={{
                placeholder: "technician@example.com",
                autoCapitalize: "none",
                keyboardType: "email-address",
              }}
            />
            <RHFInput
              control={control}
              name="eventRank"
              label="Event rank"
              Component={BaseInput}
              componentProps={{
                placeholder: "Event rank",
                keyboardType: "numeric",
              }}
            />
            <RHFInput
              control={control}
              name="workspaceRoleRank"
              label="Workspace role rank"
              Component={BaseInput}
              componentProps={{
                placeholder: "Workspace role rank",
                keyboardType: "numeric",
              }}
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
              title={isSubmitting ? "Assigning…" : "Assign"}
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
