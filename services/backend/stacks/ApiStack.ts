import { StackContext, Api, use } from "sst/constructs";

const COGNITO_REGION = "us-east-1";
const COGNITO_USER_POOL_ID = "us-east-1_9uafTDTow";
const COGNITO_CLIENT_ID = "48h1itjn5g18fjbsap0cnqrr08";

export function ApiStack({ stack, app }: StackContext) {
  const api = new Api(stack, "Api", {
    cors: {
      allowHeaders: ["Authorization", "Content-Type"],
      allowMethods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
      allowOrigins: ["http://localhost:3000"],
    },

    authorizers: {
      jwt: {
        type: "jwt",
        jwt: {
          issuer: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`,
          audience: [COGNITO_CLIENT_ID],
        },
      },
    },

    defaults: {
      authorizer: "jwt",
      function: {
        environment: {
          COGNITO_REGION,
          COGNITO_USER_POOL_ID,
          COGNITO_CLIENT_ID,
          DATABASE_URL: process.env.DATABASE_URL!,
          SES_FROM_EMAIL: "domniea@gmail.com",
          APP_URL: "http://localhost:3000",
        },
        nodejs: {
          install: ["@prisma/client"],
          esbuild: {
            external: ["@prisma/client", ".prisma/client"],
          },
        },
      },
    },

    routes: {
      // Auth
      "GET /me": "src/functions/me.handler",
      "DELETE /account": "src/functions/account/delete.handler",

      // Dashboard
      "GET /dashboard": "src/functions/dashboard/list.handler",

      // Workspaces
      "GET /workspaces": "src/functions/workspaces/list.handler",
      "POST /workspaces/org": "src/functions/workspaces/createOrg.handler",
      "DELETE /workspaces/{workspaceId}":
        "src/functions/workspaces/delete.handler",

      // Members
      "GET /workspaces/{workspaceId}/members":
        "src/functions/members/list.handler",
      "GET /workspaces/{workspaceId}/members/lookup":
        "src/functions/members/lookup.handler",
      "PATCH /workspaces/{workspaceId}/members/{userId}":
        "src/functions/members/updateRole.handler",
      "DELETE /workspaces/{workspaceId}/members/{userId}":
        "src/functions/members/remove.handler",

      // Events
      "GET /workspaces/{workspaceId}/events":
        "src/functions/events/list.handler",
      "POST /workspaces/{workspaceId}/events":
        "src/functions/events/create.handler",
      "DELETE /events/{eventId}": "src/functions/events/delete.handler",

      // Roster
      "GET /events/{eventId}/roster":
        "src/functions/events/roster/list.handler",
      "DELETE /events/{eventId}/roster/pending-invites/{eventInviteId}":
        "src/functions/events/roster/deletePendingInvite.handler",
      "POST /events/{eventId}/roster/assignments":
        "src/functions/events/roster/assign.handler",

      // Invites
      "POST /workspaces/{workspaceId}/invites":
        "src/functions/invites/create.handler",
      "GET /workspaces/{workspaceId}/invites":
        "src/functions/invites/list.handler",
      "POST /invites/accept": "src/functions/invites/accept.handler",
      "PATCH /workspaces/{workspaceId}/invites/{inviteId}/revoke":
        "src/functions/invites/revoke.handler",
    },
  });

  api.attachPermissions([
    "ses:SendEmail",
    "ses:SendRawEmail",
    "cognito-idp:AdminDeleteUser",
  ]);
  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return { api };
}
