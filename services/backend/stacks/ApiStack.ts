import { StackContext, Api } from "sst/constructs";

export function ApiStack({ stack }: StackContext) {
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        environment: {
          COGNITO_REGION: "us-east-2",
          COGNITO_USER_POOL_ID: "us-east-2_2hWkc6GeE",
          COGNITO_CLIENT_ID: "5632vu9ba8fksa9dibn07udh4l",
        },
      },
    },
    routes: {
      "GET /me": "src/functions/me.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return { api };
}
