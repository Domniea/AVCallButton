"use client";

import { BaseInput } from "@/components/reusable/BaseInput";
import { BaseButton } from "@/components/reusable/BaseButton";
import { useAppForm } from "@av/forms/src/useAppForm";
import { RHFInput } from "@av/forms/src/controllers/RHFInput";
import { assignStaffSchema } from "@av/forms/src/schemas/roster/assignStaffSchema";
import { Dialog, Portal, VStack } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import type { z } from "zod";
import { useDispatch } from "react-redux";
import { AppDispatch, AssignStaffData } from "@av/store";
import { assignStaffThunk } from "@av/store/src/roster/roster.thunks";

type AssignStaffModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AssignStaffModal({
  isOpen,
  onClose,
}: AssignStaffModalProps) {
  const { workspaceId, eventId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const form = useAppForm(assignStaffSchema, {
    email: "",
    eventRank: 0,
    workspaceRoleRank: 0,
  });

  const onSubmit = async (data: z.infer<typeof assignStaffSchema>) => {
    try {
      //   await axios.post(`/api/workspace/${workspaceId}/event/${eventId}/roster/assignments`, data);
      console.log(data);
      dispatch(assignStaffThunk({ eventId: eventId as string, data: data as AssignStaffData }));
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Assign staff</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Body>
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
                </VStack>
              </Dialog.Body>
              <Dialog.Footer gap={3}>
                <BaseButton variety="tertiary" type="button" onClick={onClose}>
                  Cancel
                </BaseButton>
                <BaseButton
                  variety="primary"
                  type="submit"
                  title={isSubmitting ? "Assigning…" : "Assign"}
                />
              </Dialog.Footer>
            </form>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
