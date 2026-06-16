"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { Box, Text, VStack } from "@chakra-ui/react";
import { fetchAuthSession } from "aws-amplify/auth";

import type { RootState, RosterAssignment, RoomCoverage, ZoneCoverage } from "@av/store";
import {
  assignRoomCoverage,
  assignZoneCoverage,
} from "@av/store";

import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseModal } from "@/components/reusable/BaseModal";

export type CoverageTarget = {
  kind: "room" | "zone";
  id: string;
  name: string;
};

type AssignCoverageModalProps = {
  isOpen: boolean;
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
  const subtitle = [assignment.roleName, `Rank ${assignment.eventRank}`]
    .filter(Boolean)
    .join(" · ");

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
      onClick={onSelect}
      cursor="pointer"
      textAlign="left"
    >
      <Box minW={0}>
        <Text fontSize="sm" color="text" truncate>
          {assignment.email ?? "No email"}
        </Text>
        <Text fontSize="xs" color="gray.500">
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
  return "Could not assign coverage. Try again.";
}

export default function AssignCoverageModal({
  isOpen,
  target,
  onClose,
  onAssigned,
}: AssignCoverageModalProps) {
  const { eventId } = useParams<{ eventId: string }>();
  const assignments = useSelector(
    (state: RootState) => state.roster.assignments,
  );
  const rosterReady = useSelector(
    (state: RootState) =>
      state.roster.eventId === eventId &&
      state.roster.fetchStatus === "succeeded",
  );

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
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign to coverage"
      size="md"
      scrollBehavior="inside"
    >
      <BaseModal.Body>
        <VStack align="stretch" gap={4}>
          <Text fontSize="sm" color="gray.500">
            {target
              ? `Add rostered staff to ${targetLabel}.`
              : "Select a room or zone first."}
          </Text>

          {!rosterReady ? (
            <Text fontSize="sm" color="gray.500">
              Loading event roster…
            </Text>
          ) : assignments.length === 0 ? (
            <Text fontSize="sm" color="gray.500">
              No one on the event roster yet. Assign staff to the event first.
            </Text>
          ) : (
            <VStack align="stretch" gap={2}>
              {assignments.map((assignment) => (
                <RosterOption
                  key={assignment.membershipId}
                  assignment={assignment}
                  selected={membershipId === assignment.membershipId}
                  onSelect={() => setMembershipId(assignment.membershipId)}
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
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseButton variety="tertiary" type="button" onClick={handleClose}>
          Cancel
        </BaseButton>
        <BaseButton
          variety="primary"
          type="button"
          title={isSubmitting ? "Assigning…" : "Assign"}
          onClick={() => void handleSubmit()}
        />
      </BaseModal.Footer>
    </BaseModal>
  );
}
