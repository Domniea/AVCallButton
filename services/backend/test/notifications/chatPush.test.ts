import { describe, expect, it } from "vitest";

import {
  chatThreadPushTitle,
  previewChatPushBody,
} from "../../src/functions/lib/chat/notify";

describe("previewChatPushBody", () => {
  it("returns short bodies unchanged after trim", () => {
    expect(previewChatPushBody("  hi  ")).toBe("hi");
  });

  it("truncates long bodies with ellipsis", () => {
    const long = "a".repeat(121);
    const preview = previewChatPushBody(long);
    expect(preview.length).toBe(118);
    expect(preview.endsWith("…")).toBe(true);
  });
});

describe("chatThreadPushTitle", () => {
  it("labels event / zone / DM threads", () => {
    expect(
      chatThreadPushTitle({
        type: "EVENT_GROUP",
        eventName: "Gala",
        zoneName: null,
      }),
    ).toBe("Gala chat");
    expect(
      chatThreadPushTitle({
        type: "EVENT_GROUP",
        eventName: null,
        zoneName: null,
      }),
    ).toBe("Event chat");
    expect(
      chatThreadPushTitle({
        type: "ZONE",
        eventName: null,
        zoneName: "Ballroom",
      }),
    ).toBe("Ballroom chat");
    expect(
      chatThreadPushTitle({
        type: "DM",
        eventName: null,
        zoneName: null,
      }),
    ).toBe("Direct message");
    expect(
      chatThreadPushTitle({
        type: "OTHER",
        eventName: null,
        zoneName: null,
      }),
    ).toBe("Chat");
  });
});
