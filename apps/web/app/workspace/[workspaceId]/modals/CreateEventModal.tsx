"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Text, VStack } from "@chakra-ui/react";

import type { AppDispatch } from "@av/store";
import { createEventThunk, fetchWorkspacesThunk } from "@av/store";
import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseInput } from "@/components/reusable/BaseInput";
import { BaseModal } from "@/components/reusable/BaseModal";

type CreateEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateEventModal({
  isOpen,
  onClose,
}: CreateEventModalProps) {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [venue, setVenue] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setLocation("");
      setVenue("");
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const onSubmit = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setSubmitError("Show name must be at least 2 characters.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await dispatch(
        createEventThunk({
          workspaceId,
          data: {
            name: trimmedName,
            location: location.trim() || undefined,
            venue: venue.trim() || undefined,
          },
        }),
      ).unwrap();

      void dispatch(fetchWorkspacesThunk());
      onClose();
      router.push(
        `/workspace/${workspaceId}/event/${result.event.id}`,
      );
    } catch (err) {
      setSubmitError(
        typeof err === "string" ? err : "Could not create show. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Create show">
      <BaseModal.Body>
        <VStack align="stretch" gap={4}>
          <BaseInput
            label="Show name"
            placeholder="TechCon 2025"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <BaseInput
            label="Location"
            placeholder="Optional"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <BaseInput
            label="Venue"
            placeholder="Optional"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
          />
          {submitError ? (
            <Text color="red.400" fontSize="sm">
              {submitError}
            </Text>
          ) : null}
        </VStack>
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseButton variety="secondary" type="button" onClick={onClose}>
          Cancel
        </BaseButton>
        <BaseButton
          variety="primary"
          type="button"
          onClick={() => void onSubmit()}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating…" : "Create show"}
        </BaseButton>
      </BaseModal.Footer>
    </BaseModal>
  );
}
