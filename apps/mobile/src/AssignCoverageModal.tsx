import React, { useEffect, useState } from "react";
import {
  Modal as RNModal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import { Box, VStack, Text, HStack, useColorModeValue } from "native-base";
import { useSelector } from "react-redux";
import { fetchAuthSession } from "aws-amplify/auth";

import type {
  RootState,
  RosterAssignment,
  RoomCoverage,
  ZoneCoverage,
} from "@av/store";
import { assignRoomCoverage, assignZoneCoverage } from "@av/store";

import { BaseButton } from "../components/BaseButton";

export type CoverageTarget = {
  kind: "room" | "zone";
  id: string;
  name: string;
};

type AssignCoverageModalProps = {
  isOpen: boolean;
  eventId: string;
  target: CoverageTarget | null;
  onClose: () => void;
  onAssigned?: (
    target: CoverageTarget,
    coverage: RoomCoverage | ZoneCoverage,
  ) => void;
};

function RosterOption({
  assignment,
  selected,
  onSelect,
}: {
  assignment: RosterAssignment;
  selected: boolean;
  onSelect: () => void;
}) {
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const border = useColorModeValue(
    selected ? "blue.400" : "cardBorder",
    selected ? "blue.400" : "cardBorderDark",
  );
  const selectedBg = useColorModeValue("blue.50", "whiteAlpha.100");

  const subtitle = [assignment.roleName, `Rank ${assignment.eventRank}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable onPress={onSelect}>
      <HStack
        justifyContent="space-between"
        alignItems="center"
        space={3}
        py={2}
        px={3}
        borderWidth={1}
        borderColor={border}
        borderRadius="md"
        bg={selected ? selectedBg : surface}
      >
        <Box flex={1}>
          <Text fontSize="sm" color={textColor} numberOfLines={1}>
            {assignment.email ?? "No email"}
          </Text>
          <Text fontSize="xs" color={muted}>
            {subtitle}
          </Text>
        </Box>
        <Box
          w={4}
          h={4}
          borderRadius="full"
          borderWidth={2}
          borderColor={selected ? "blue.500" : "gray.400"}
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
  return "Could not assign coverage. Try again.";
}

export default function AssignCoverageModal({
  isOpen,
  eventId,
  target,
  onClose,
  onAssigned,
}: AssignCoverageModalProps) {
  const assignments = useSelector(
    (state: RootState) => state.roster.assignments,
  );
  const rosterReady = useSelector(
    (state: RootState) =>
      state.roster.eventId === eventId &&
      state.roster.fetchStatus === "succeeded",
  );

  const textColor = useColorModeValue("text", "textDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const muted = useColorModeValue("muted", "mutedDark");

  const [membershipId, setMembershipId] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setMembershipId("");
    setSubmitError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!target) return;
    setSubmitError(null);

    if (!membershipId) {
      setSubmitError("Select someone from the event roster.");
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

      const payload = { membershipId };
      if (target.kind === "room") {
        const { coverage } = await assignRoomCoverage(
          token,
          eventId,
          target.id,
          payload,
        );
        onAssigned?.(target, coverage);
      } else {
        const { coverage } = await assignZoneCoverage(
          token,
          eventId,
          target.id,
          payload,
        );
        onAssigned?.(target, coverage);
      }

      handleClose();
    } catch (err: unknown) {
      setSubmitError(apiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetLabel =
    target?.kind === "room"
      ? `room “${target.name}”`
      : target?.kind === "zone"
        ? `zone “${target.name}”`
        : "";

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
            maxH="85%"
          >
            <HStack justifyContent="space-between" alignItems="center" mb={4}>
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                Assign to coverage
              </Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text fontSize="xl" color={muted}>
                  ×
                </Text>
              </Pressable>
            </HStack>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <VStack space={4}>
                <Text fontSize="sm" color={muted}>
                  {target
                    ? `Add rostered staff to ${targetLabel}.`
                    : "Select a room or zone first."}
                </Text>

                {!rosterReady ? (
                  <Text fontSize="sm" color={muted}>
                    Loading event roster…
                  </Text>
                ) : assignments.length === 0 ? (
                  <Text fontSize="sm" color={muted}>
                    No one on the event roster yet. Assign staff to the event
                    first.
                  </Text>
                ) : (
                  <VStack space={2}>
                    {assignments.map((assignment) => (
                      <RosterOption
                        key={assignment.membershipId}
                        assignment={assignment}
                        selected={membershipId === assignment.membershipId}
                        onSelect={() =>
                          setMembershipId(assignment.membershipId)
                        }
                      />
                    ))}
                  </VStack>
                )}

                {submitError ? (
                  <Text fontSize="sm" color="red.500">
                    {submitError}
                  </Text>
                ) : null}
              </VStack>
            </ScrollView>

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
