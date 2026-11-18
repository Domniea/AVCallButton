import { describe, expect, it } from "vitest";

import { isExpoPushToken } from "../../src/functions/lib/push/expoPush";
import { isWebPushSubscription } from "../../src/functions/lib/push/webPush";

describe("isExpoPushToken", () => {
  it("accepts Expo and Exponent token shapes", () => {
    expect(isExpoPushToken("ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]")).toBe(
      true,
    );
    expect(isExpoPushToken("ExpoPushToken[abc]")).toBe(true);
  });

  it("rejects garbage", () => {
    expect(isExpoPushToken("")).toBe(false);
    expect(isExpoPushToken("not-a-token")).toBe(false);
    expect(isExpoPushToken("ExpoPushToken[]")).toBe(false);
  });
});

describe("isWebPushSubscription", () => {
  it("accepts a minimal valid subscription JSON", () => {
    const token = JSON.stringify({
      endpoint: "https://push.example/abc",
      keys: { p256dh: "x", auth: "y" },
    });
    expect(isWebPushSubscription(token)).toBe(true);
  });

  it("rejects invalid payloads", () => {
    expect(isWebPushSubscription("")).toBe(false);
    expect(isWebPushSubscription("{}")).toBe(false);
    expect(
      isWebPushSubscription(
        JSON.stringify({ endpoint: "https://x", keys: { p256dh: "x" } }),
      ),
    ).toBe(false);
  });
});
