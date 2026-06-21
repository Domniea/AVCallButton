"use client";

import { useState } from "react";
import { BaseInput } from "@/components/reusable/BaseInput";
import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseModal } from "@/components/reusable/BaseModal";
import { useAppForm } from "@av/forms/src/useAppForm";
import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { assignStaffSchema } from "@av/forms/src/schemas/roster/assignStaffSchema";
import { Text, VStack } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import type { z } from "zod";
import { useDispatch } from "react-redux";
import type { AppDispatch, AssignStaffData } from "@av/store";
import {
  assignStaffThunk,
  fetchRosterThunk,
} from "@av/store/src/roster/roster.thunks";

type AssignStaffModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AssignStaffModal({
  isOpen,
  onClose,
}: AssignStaffModalProps) {
  const { eventId } = useParams<{ eventId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      await dispatch(
        assignStaffThunk({ eventId: eventId as string, data: payload }),
      ).unwrap();
      await dispatch(fetchRosterThunk(eventId as string)).unwrap();
      handleClose();
    } catch (err) {
      setSubmitError(
        typeof err === "string" ? err : "Could not assign staff. Try again.",
      );
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Assign staff">
      <form onSubmit={handleSubmit(onSubmit)}>
        <BaseModal.Body>
          <VStack align="stretch" gap={4}>
            <RHFInput
              control={control}
              name="email"
              label="Email"
              Component={BaseInput}
              componentProps={{
                placeholder: "technician@example.com",
                autoComplete: "email",
                type: "email",
              }}
            />
            <RHFInput
              control={control}
              name="eventRank"
              label="Event rank"
              Component={BaseInput}
              componentProps={{
                placeholder: "Event rank",
                type: "number",
              }}
            />
            <RHFInput
              control={control}
              name="workspaceRoleRank"
              label="Workspace role rank"
              Component={BaseInput}
              componentProps={{
                placeholder: "Workspace role rank",
                type: "number",
              }}
            />
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
            type="submit"
            title={isSubmitting ? "Assigning…" : "Assign"}
          />
        </BaseModal.Footer>
      </form>
    </BaseModal>
  );
}
