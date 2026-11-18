import { z } from "zod";

export const GUEST_HELP_MESSAGE_MAX_LENGTH = 500;

export const GUEST_HELP_PRIORITIES = ["HIGH", "MEDIUM"] as const;
export type GuestHelpPriority = (typeof GUEST_HELP_PRIORITIES)[number];

export const guestHelpRequestSchema = z.object({
  message: z
    .string()
    .max(GUEST_HELP_MESSAGE_MAX_LENGTH, "Message is too long"),
});

export type GuestHelpRequestSchema = z.infer<typeof guestHelpRequestSchema>;
