import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { requireAuthUser } from "@av/auth-core";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const user = await requireAuthUser(event, {
      region: process.env.COGNITO_REGION!,
      userPoolId: process.env.COGNITO_USER_POOL_ID!,
      clientId: process.env.COGNITO_CLIENT_ID!,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
        },
      }),
    };
  } catch (err: any) {
    const statusCode = err.statusCode ?? 401;
    return {
      statusCode,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }
};
