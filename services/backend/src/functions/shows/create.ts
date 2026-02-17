import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from "aws-lambda";

import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { db, TABLE_NAME } from "../lib/db";
import { authorize } from "../lib/authorization";
import crypto from "crypto";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer =
  async (event) => {
    try {
      const claims = event.requestContext.authorizer.jwt.claims;
      const userId = claims.sub as string;

      const workspaceId = event.pathParameters?.id;
      if (!workspaceId) {
        return badRequest("Missing workspaceId");
      }

      if (!event.body) {
        return badRequest("Missing request body");
      }

      const { name } = JSON.parse(event.body);
      if (
        !name ||
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 100
      ) {
        return badRequest("Invalid show name");
      }

      const trimmedName = name.trim();

      await authorize(userId, workspaceId, "show:create");

      const showId = crypto.randomUUID();
      const now = new Date().toISOString();

      await db.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            pk: `WORKSPACE#${workspaceId}`,
            sk: `SHOW#${showId}`,
            entity: "show",
            showId,
            name: trimmedName,
            status: "draft",
            createdBy: userId,
            createdAt: now,
            primaryLeadTech: userId,
            primaryShowLead: null,
          },
          ConditionExpression: "attribute_not_exists(pk)",
        })
      );

      return {
        statusCode: 201,
        body: JSON.stringify({
          show: {
            showId,
            name: trimmedName,
            status: "draft",
            primaryLeadTech: userId,
            createdAt: now,
          },
        }),
      };
    } catch (error: any) {
      if (error.message === "NOT_AUTHORIZED") {
        return forbidden("Not authorized");
      }

      if (error.message === "FORBIDDEN") {
        return forbidden("Forbidden");
      }

      console.error("Failed to create show:", error);

      return serverError("Failed to create show");
    }
  };

function badRequest(message: string) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: message }),
  };
}

function forbidden(message: string) {
  return {
    statusCode: 403,
    body: JSON.stringify({ error: message }),
  };
}

function serverError(message: string) {
  return {
    statusCode: 500,
    body: JSON.stringify({ error: message }),
  };
}
