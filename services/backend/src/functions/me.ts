import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from "aws-lambda";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer =
  async (event) => {
    try {
      const claims = event.requestContext.authorizer.jwt.claims;

      const userId = claims.sub as string;
      const email = claims.email as string;

      return {
        statusCode: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          email,
        }),
      };
    } catch (error) {
      return {
        statusCode: 401,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }
  };