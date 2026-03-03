import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { prisma } from "../lib/prisma";
import { serverError } from "../lib/responses";

import {
  CognitoIdentityProviderClient,
  AdminDeleteUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const email = typeof claims.email === "string" ? claims.email : null;

    await prisma.membership.deleteMany({
      where: { userId: userId },
    });

    const cognito = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION,
    });

    await cognito.send(
      new AdminDeleteUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: userId,
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Account deleted",
        email,
        userId,
      }),
    };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return serverError("Failed to delete account");
  }
};
