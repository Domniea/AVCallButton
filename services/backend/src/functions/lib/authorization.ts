import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME } from "./db";

export type Role = "owner" | "showLead" | "leadTech" | "tech";

export const roleRank: Record<Role, number> = {
  tech: 1,
  leadTech: 2,
  showLead: 3,
  owner: 4,
};

export type Action =
  | "workspace:update"
  | "workspace:delete"
  | "workspace:billing"
  | "workspace:invite"
  | "workspace:changeRole"
  | "workspace:removeMember"
  | "show:create"
  | "show:update"
  | "show:delete"
  | "show:assignTech"
  | "show:assignLeadTech"
  | "show:assignShowLead"
  | "show:view";

export const actionMinimumRank: Record<Action, number> = {
  "workspace:update": 3,
  "workspace:delete": 4,
  "workspace:billing": 4,
  "workspace:invite": 3,
  "workspace:changeRole": 4,
  "workspace:removeMember": 4,

  "show:create": 2,
  "show:update": 2,
  "show:delete": 3,
  "show:assignTech": 2,
  "show:assignLeadTech": 2,
  "show:assignShowLead": 3,
  "show:view": 1,
};

async function getMembership(userId: string, workspaceId: string) {
  const result = await db.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `USER#${userId}`,
        sk: `MEMBERSHIP#${workspaceId}`,
      },
    }),
  );

  return result.Item ?? null;
}

export async function authorize(
  userId: string,
  workspaceId: string,
  action: Action,
) {
  const membership = await getMembership(userId, workspaceId);

  if (!membership || membership.status !== "active") {
    throw new Error("NOT_AUTHORIZED");
  }

  const role = membership.role as Role;

  const userRank = roleRank[role];
  const requiredRank = actionMinimumRank[action];

  if (userRank < requiredRank) {
    throw new Error("FORBIDDEN");
  }

  return membership;
}

export async function hasPermission(
  userId: string,
  workspaceId: string,
  action: Action,
): Promise<boolean> {
  try {
    await authorize(userId, workspaceId, action);
    return true;
  } catch {
    return false;
  }
}
