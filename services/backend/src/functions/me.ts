import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { requireAuthIdentity } from "@av/auth-core";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Headers": "Authorization,Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const identity = await requireAuthIdentity(event, {
      region: process.env.COGNITO_REGION!,
      userPoolId: process.env.COGNITO_USER_POOL_ID!,
      clientId: process.env.COGNITO_CLIENT_ID!,
    });

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: identity.sub,
        email: identity.email,
      }),
    };
  } catch (err: any) {
    const statusCode = err.statusCode ?? 401;

    return {
      statusCode,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }
};
