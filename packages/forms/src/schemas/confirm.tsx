import { z } from "zod";

export const confirmSchema = z.object({
  code: z
    .string()
    .min(6, "Confirmation code must be 6 digits"),
});

export type ConfirmSchema = z.infer<typeof confirmSchema>;
