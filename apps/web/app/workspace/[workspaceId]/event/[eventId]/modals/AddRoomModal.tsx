"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Box, Text, VStack } from "@chakra-ui/react";
import { fetchAuthSession } from "aws-amplify/auth";

import type { AppDispatch, RootState } from "@av/store";
import { createRoom, fetchEventsThunk } from "@av/store";

import { BaseInput } from "@/components/reusable/BaseInput";
import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseModal } from "@/components/reusable/BaseModal";

type AddRoomModalProps = {
  isOpen: boolean;
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

export default function AddRoomModal({ isOpen, onClose }: AddRoomModalProps) {
  const { workspaceId, eventId } = useParams<{
    workspaceId: string;
    eventId: string;
  }>();
  const dispatch = useDispatch<AppDispatch>();
  const event = useSelector((state: RootState) =>
    state.events.events.find((e) => e.id === eventId),
  );
  const zones = event?.zones ?? [];

  const [roomName, setRoomName] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setRoomName("");
    setZoneId("");
    setNameError(null);
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    const trimmed = roomName.trim();
    if (!trimmed) {
      setNameError("Room name is required");
      return;
    }
    if (trimmed.length > 100) {
      setNameError("Room name is too long");
      return;
    }
    setNameError(null);
    setIsSubmitting(true);

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) {
        setSubmitError("Not signed in.");
        return;
      }

      await createRoom(token, eventId, {
        name: trimmed,
        ...(zoneId ? { zoneId } : {}),
      });

      await dispatch(fetchEventsThunk(workspaceId));
      handleClose();
    } catch (err: unknown) {
      setSubmitError(apiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Add room">
      <BaseModal.Body>
        <VStack align="stretch" gap={4}>
          <Text fontSize="sm" color="gray.500">
            Add a single room. Optionally assign it to an existing zone.
          </Text>
          <BaseInput
            label="Room name"
            placeholder="e.g. 150AB"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            error={nameError ?? undefined}
          />
          <VStack align="stretch" gap={2}>
            <Text fontFamily="heading" fontSize="md" color="text">
              Zone (optional)
            </Text>
            <Box
              borderWidth="1px"
              borderColor="inputBorder"
              borderRadius="md"
              h="52px"
              bg="inputBg"
              overflow="hidden"
            >
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                style={{
                  width: "100%",
                  height: "100%",
                  padding: "0 16px",
                  border: "none",
                  background: "transparent",
                  fontSize: "16px",
                }}
              >
                <option value="">Unassigned</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </Box>
            {zones.length === 0 ? (
              <Text fontSize="sm" color="textMuted">
                No zones yet — room will be unassigned until you create a zone.
              </Text>
            ) : null}
          </VStack>
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
          title={isSubmitting ? "Adding…" : "Add room"}
          onClick={() => void handleSubmit()}
        />
      </BaseModal.Footer>
    </BaseModal>
  );
}
