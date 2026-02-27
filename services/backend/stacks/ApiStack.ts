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

      // Dashboard
      "GET /dashboard": "src/functions/dashboard/list.handler",

      // Workspaces
      "GET /workspaces": "src/functions/workspaces/list.handler",
      "POST /workspaces/org": "src/functions/workspaces/createOrg.handler",
      "DELETE /workspaces/{id}": "src/functions/workspaces/delete.handler",

      // Routes:
      "GET /workspaces/{id}/members": "src/functions/members/list.handler",
      "PATCH /workspaces/{id}/members/{memberId}":
        "src/functions/members/updateRole.handler",
      "DELETE /workspaces/{id}/members/{memberId}":
        "src/functions/members/remove.handler",

      // Shows
      "GET /workspaces/{id}/shows": "src/functions/shows/list.handler",
      "POST /workspaces/{id}/shows": "src/functions/shows/create.handler",
      "DELETE /shows/{id}": "src/functions/shows/delete.handler",

      //Invites
      "POST /workspaces/{id}/invites": "src/functions/invites/create.handler",
      "GET /workspaces/{id}/invites": "src/functions/invites/list.handler",
      "POST /invites/accept": "src/functions/invites/accept.handler",
      "DELETE /invites/{id}": "src/functions/invites/cancel.handler",
    },
  });

  api.attachPermissions(["ses:SendEmail", "ses:SendRawEmail"]);
  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return { api };
}
