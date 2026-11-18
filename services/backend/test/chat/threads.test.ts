import { describe, expect, it } from "vitest";

import {
  LEAD_MIN_EVENT_RANK,
  buildDmKey,
} from "../../src/functions/lib/chat/threads";
import { roleRank } from "../../src/functions/lib/permissions";

describe("buildDmKey", () => {
  it("is order-independent and colon-joined", () => {
    expect(buildDmKey("b", "a")).toBe("a:b");
    expect(buildDmKey("a", "b")).toBe("a:b");
  });
});

describe("LEAD_MIN_EVENT_RANK", () => {
  it("matches permissions lead rank", () => {
    expect(LEAD_MIN_EVENT_RANK).toBe(roleRank.lead);
  });
});
