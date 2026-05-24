/**
 * Re-exports @prisma/client for Lambda ESM handlers.
 * Named imports from the CJS package fail at runtime when esbuild marks it external.
 */
import prismaPackage from "@prisma/client";

export const PrismaClient = prismaPackage.PrismaClient;
export const Prisma = prismaPackage.Prisma;
export const MembershipStatus = prismaPackage.MembershipStatus;
export const InviteStatus = prismaPackage.InviteStatus;
export const EventInviteStatus = prismaPackage.EventInviteStatus;
export const MembershipType = prismaPackage.MembershipType;

export type * from "@prisma/client";
