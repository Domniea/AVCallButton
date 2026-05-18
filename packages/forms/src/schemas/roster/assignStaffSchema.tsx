import { z } from "zod";

export const assignStaffSchema = z.object({
    email: z.string().email(),
    eventRank: z.coerce.number(),
    workspaceRoleRank: z.coerce.number().optional(),
}).refine((data) => {
    if (data.workspaceRoleRank) {
        return data.eventRank <= data.workspaceRoleRank;
    }
    return true;
}, {
    message: "Event rank must be less than or equal to workspace role rank",
    path: ["eventRank"],
});