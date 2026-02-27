import type {
    APIGatewayProxyHandlerV2WithJWTAuthorizer,
  } from "aws-lambda";
  
  import { prisma } from "../lib/prisma";
  import { authorize } from "../lib/authorization";
  import { roleRank, Role } from "../lib/permissions";
  import { badRequest, forbidden, serverError } from "../lib/responses";
import { sendInviteEmail } from "../lib/email";
  
  const VALID_ROLES: Role[] = ["owner", "showLead", "leadTech", "tech"];
  
  export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer =
    async (event) => {
      try {
        const claims = event.requestContext.authorizer.jwt.claims;
        const userId = claims.sub as string;
  
        const workspaceId = event.pathParameters?.id;
        if (!workspaceId) {
          return badRequest("Missing workspaceId");
        }
  
        const membership = await authorize(userId, workspaceId, "workspace:invite");
  
        if (!event.body) {
          return badRequest("Missing request body");
        }
  
        const { email, role } = JSON.parse(event.body);
  
        if (!email || typeof email !== "string" || !email.includes("@")) {
          return badRequest("Invalid email");
        }
  
        if (!role || !VALID_ROLES.includes(role)) {
          return badRequest("Invalid role");
        }
  
        const callerRank = roleRank[membership.role as Role];
        const invitedRank = roleRank[role as Role];
        if (invitedRank > callerRank) {
          return forbidden("Cannot invite someone to a role above your own");
        }
  
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
  
        const invite = await prisma.invite.upsert({
          where: {
            email_workspaceId: { email, workspaceId },
          },
          update: {
            role,
            invitedBy: userId,
            expiresAt,
            status: "pending",
          },
          create: {
            email,
            role,
            workspaceId,
            invitedBy: userId,
            expiresAt,
          },
        });

        const workspace = await prisma.workspace.findUniqueOrThrow({
            where: { id: workspaceId },
            select: { name: true },
          });
          
          await sendInviteEmail({
            to: email,
            workspaceName: workspace.name,
            inviterEmail: claims.email as string,
            token: invite.token,
          });
  
        return {
          statusCode: 201,
          body: JSON.stringify({ invite }),
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "NOT_AUTHORIZED") {
            return forbidden("Not a member of this workspace");
          }
          if (error.message === "FORBIDDEN") {
            return forbidden("Insufficient permissions");
          }
        }
        console.error("Failed to create invite:", error);
        return serverError("Failed to create invite");
      }
    };