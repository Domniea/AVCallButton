import { z } from "zod";

export const createRoomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Room name is required")
    .max(100, "Room name is too long"),
  zoneId: z.string(),
});

export type CreateRoomSchema = z.infer<typeof createRoomSchema>;
