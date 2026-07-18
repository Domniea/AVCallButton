import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { prisma } from "../../lib/prisma";
import { DevicePlatform } from "../../lib/prismaClient";
import { sendExpoPush } from "../../lib/push/expoPush";
import { sendWebPush } from "../../lib/push/webPush";
import { badRequest, serverError } from "../../lib/responses";

/** Send a diagnostic push to the caller's registered device tokens (web + native). */
export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    if (!userId) return badRequest("Missing user");

    const deviceTokens = await prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true, platform: true },
    });

    const webTokens = deviceTokens
      .filter((row) => row.platform === DevicePlatform.WEB)
      .map((row) => row.token);
    const nativeTokens = deviceTokens
      .filter(
        (row) =>
          row.platform === DevicePlatform.IOS ||
          row.platform === DevicePlatform.ANDROID,
      )
      .map((row) => row.token);

    if (webTokens.length === 0 && nativeTokens.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error:
            "No push subscription found. Enable notifications on this device first.",
          sent: 0,
        }),
      };
    }

    const notification = {
      title: "AV Call Button",
      body: "Test notification — if you see this, push is working.",
    };

    const [{ staleTokens: staleWeb }, { staleTokens: staleNative }] =
      await Promise.all([
        sendWebPush(webTokens, notification),
        sendExpoPush(nativeTokens, notification),
      ]);

    const staleTokens = [...staleWeb, ...staleNative];
    if (staleTokens.length > 0) {
      await prisma.deviceToken.deleteMany({
        where: { token: { in: staleTokens } },
      });
    }

    const sent =
      webTokens.length +
      nativeTokens.length -
      staleTokens.length;

    return {
      statusCode: 200,
      body: JSON.stringify({
        sent,
        staleRemoved: staleTokens.length,
        webSent: webTokens.length - staleWeb.length,
        nativeSent: nativeTokens.length - staleNative.length,
      }),
    };
  } catch (error) {
    console.error("Failed to send test push:", error);
    return serverError("Failed to send test notification");
  }
};
