// import type {
//   APIGatewayProxyHandlerV2WithJWTAuthorizer,
// } from "aws-lambda";

// export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
//   event
// ) => {
//   const claims = event.requestContext.authorizer.jwt.claims;

//   const userId = claims.sub;
//   const email = claims.email;

//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       userId,
//       email,
//       workspaces: [
//         {
//           workspaceId: "temp-personal",
//           name: "Personal Workspace",
//           role: "owner",
//         },
//       ],
//     }),
//   };
// };

import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from "aws-lambda";

import {
  QueryCommand,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

import { db, TABLE_NAME } from "./lib/db";
import crypto from "crypto";

console.log("APP_TABLE_NAME:", process.env.APP_TABLE_NAME);

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event
) => {
  const claims = event.requestContext.authorizer.jwt.claims;
  const userId = claims.sub;

  const userPk = `USER#${userId}`;

  /**
   * 1️⃣ Get memberships for this user
   */
  const membershipsResult = await db.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
      ExpressionAttributeValues: {
        ":pk": userPk,
        ":sk": "MEMBERSHIP#",
      },
    })
  );

  let memberships = membershipsResult.Items ?? [];

  /**
   * 2️⃣ First login → create personal workspace
   */
  if (memberships.length === 0) {
    const workspaceId = crypto.randomUUID();

    // Create workspace DETAILS row
    await db.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: `WORKSPACE#${workspaceId}`,
          sk: "DETAILS",
          workspaceId,
          name: "Personal Workspace",
          type: "personal",
          createdAt: new Date().toISOString(),
        },
      })
    );

    // Create membership row (user → workspace)
    await db.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: userPk,
          sk: `MEMBERSHIP#${workspaceId}`,
          workspaceId,
          role: "owner",
        },
      })
    );

    memberships = [
      {
        workspaceId,
        role: "owner",
      },
    ];
  }

  /**
   * 3️⃣ Load workspace details
   */
  const workspaces = await Promise.all(
    memberships.map(async (membership) => {
      const result = await db.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            pk: `WORKSPACE#${membership.workspaceId}`,
            sk: "DETAILS",
          },
        })
      );

      return {
        workspaceId: membership.workspaceId,
        role: membership.role,
        name: result.Item?.name,
        type: result.Item?.type,
      };
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ workspaces }),
  };
};
