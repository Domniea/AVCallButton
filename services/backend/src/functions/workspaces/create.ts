import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME } from "../lib/db";
import crypto from "crypto";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub;

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }

    const { name } = JSON.parse(event.body);

    if (
      !name ||
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid workspace name" }),
      };
    }

    const workspaceId = crypto.randomUUID();
    const now = new Date().toISOString();
    const trimmedName = name.trim();

    await db.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: TABLE_NAME,
              Item: {
                pk: `WORKSPACE#${workspaceId}`,
                sk: "DETAILS",
                entity: "workspace",
                workspaceId,
                name: trimmedName,
                type: "org",
                createdAt: now,
                createdBy: userId,
              },
              ConditionExpression: "attribute_not_exists(pk)",
            },
          },

          {
            Put: {
              TableName: TABLE_NAME,
              Item: {
                pk: `USER#${userId}`,
                sk: `MEMBERSHIP#${workspaceId}`,
                entity: "membership",
                workspaceId,
                userId,
                role: "owner",
                joinedAt: now,
                status: "active",
              },
            },
          },
        ],
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        workspace: {
          workspaceId,
          name: trimmedName,
          type: "org",
          role: "owner",
          createdAt: now,
        },
      }),
    };
  } catch (error) {
    console.error("Failed to create workspace:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to create workspace",
      }),
    };
  }
};
