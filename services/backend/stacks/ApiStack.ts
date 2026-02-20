import { StackContext, Api, use } from "sst/constructs";


const COGNITO_REGION = "us-east-2";
const COGNITO_USER_POOL_ID = "us-east-2_2hWkc6GeE";
const COGNITO_CLIENT_ID = "5632vu9ba8fksa9dibn07udh4l";

export function ApiStack({ stack, app }: StackContext) {
  const api = new Api(stack, "Api", {
    cors: {
      allowHeaders: ["Authorization", "Content-Type"],
      allowMethods: ["GET", "OPTIONS"],
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
      "GET /me": "src/functions/me.handler",
      "GET /workspaces": "src/functions/workspaces/list.handler",
      "POST /workspaces/org": "src/functions/workspaces/createOrg.handler",
      "POST /workspaces/{id}/shows": "src/functions/shows/create.handler",
      "DELETE /workspaces/{id}": "src/functions/workspaces/delete.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return { api };
}
