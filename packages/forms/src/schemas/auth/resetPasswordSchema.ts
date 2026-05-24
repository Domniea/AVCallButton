import { z } from "zod";

export const resetPasswordSchema = z.object({
  code: z
    .string()
    .min(6, "Reset code must be 6 digits")
    .max(6, "Reset code must be 6 digits"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
