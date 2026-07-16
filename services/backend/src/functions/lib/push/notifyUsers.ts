import { prisma } from "../prisma";
import { DevicePlatform } from "../prismaClient";
import { sendExpoPush } from "./expoPush";
import { sendWebPush } from "./webPush";
import type { PushNotification } from "./types";

export type NotifyUsersParams = {
  userIds: string[];
  notification: PushNotification;
};

async function deleteStaleDeviceTokens(tokens: string[]): Promise<void> {
  if (tokens.length === 0) return;
  await prisma.deviceToken.deleteMany({
    where: { token: { in: tokens } },
  });
}

/** Fan out a push notification to all registered devices for the given users. */
export async function notifyUsers(params: NotifyUsersParams): Promise<void> {
  const userIds = [...new Set(params.userIds.filter(Boolean))];
  if (userIds.length === 0) return;

  const deviceTokens = await prisma.deviceToken.findMany({
    where: { userId: { in: userIds } },
    select: { token: true, platform: true },
  });

  const expoTokens = deviceTokens
    .filter(
      (row) =>
        row.platform === DevicePlatform.IOS ||
        row.platform === DevicePlatform.ANDROID,
    )
    .map((row) => row.token);

  const webTokens = deviceTokens
    .filter((row) => row.platform === DevicePlatform.WEB)
    .map((row) => row.token);

  const [{ staleTokens: staleExpoTokens }, { staleTokens: staleWebTokens }] =
    await Promise.all([
      sendExpoPush(expoTokens, params.notification),
      sendWebPush(webTokens, params.notification),
    ]);

  await deleteStaleDeviceTokens([...staleExpoTokens, ...staleWebTokens]);
}
