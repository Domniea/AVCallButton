import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const claims = event.requestContext.authorizer.jwt.claims;

  const userId = claims.sub;
  const email = claims.email;

  return {
    statusCode: 200,
    body: JSON.stringify({
      userId,
      email,
      workspaces: [
        {
          workspaceId: "temp-personal",
          name: "Personal Workspace",
          role: "owner",
        },
      ],
    }),
  };
};
