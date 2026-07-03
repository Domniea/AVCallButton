import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import type { DevicePlatform as DevicePlatformType } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { DevicePlatform } from "../../lib/prismaClient";
import { badRequest, serverError } from "../../lib/responses";

const TOKEN_MIN_LENGTH = 10;
const TOKEN_MAX_LENGTH = 4096;

function parsePlatform(value: unknown): DevicePlatformType | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  if (normalized === DevicePlatform.IOS) return DevicePlatform.IOS;
  if (normalized === DevicePlatform.ANDROID) return DevicePlatform.ANDROID;
  if (normalized === DevicePlatform.WEB) return DevicePlatform.WEB;
  return null;
}

function parseToken(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length < TOKEN_MIN_LENGTH || trimmed.length > TOKEN_MAX_LENGTH) {
    return null;
  }
  return trimmed;
}

function formatDeviceToken(row: {
  id: string;
  platform: DevicePlatformType;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    platform: row.platform,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    if (!event.body) return badRequest("Missing request body");

    let requestBody: unknown;
    try {
      requestBody = JSON.parse(event.body);
    } catch {
      return badRequest("Invalid JSON");
    }
    if (typeof requestBody !== "object" || requestBody === null) {
      return badRequest("Invalid body");
    }

    const body = requestBody as Record<string, unknown>;
    const platform = parsePlatform(body.platform);
    if (!platform) {
      return badRequest("Invalid platform (expected IOS, ANDROID, or WEB)");
    }

    const token = parseToken(body.token);
    if (!token) return badRequest("Invalid token");

    const deviceToken = await prisma.deviceToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ deviceToken: formatDeviceToken(deviceToken) }),
    };
  } catch (error) {
    console.error("Failed to upsert device token:", error);
    return serverError("Failed to register device token");
  }
};
