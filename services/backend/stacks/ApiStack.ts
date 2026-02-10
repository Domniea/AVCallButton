import { StackContext, Api, use } from "sst/constructs";
import { DatabaseStack } from "./DatabaseStack";

const COGNITO_REGION = "us-east-2";
const COGNITO_USER_POOL_ID = "us-east-2_2hWkc6GeE";
const COGNITO_CLIENT_ID = "5632vu9ba8fksa9dibn07udh4l";

export function ApiStack({ stack, app }: StackContext) {
  // const { table } = DatabaseStack({ stack, app });
  const { table } = use(DatabaseStack);

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
          APP_TABLE_NAME: table.tableName,
        },
      },
    },

    routes: {
      "GET /me": "src/functions/me.handler",
      "GET /workspaces": "src/functions/workspaces.handler",
    },
  });

  api.attachPermissions([table]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return { api };
}
