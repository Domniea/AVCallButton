import { z } from "zod";

export const confirmEmailSchema = z.object({
  code: z
    .string()
    .min(6, "Confirmation code must be 6 digits"),
});

export type ConfirmEmailSchema = z.infer<typeof confirmEmailSchema>;
