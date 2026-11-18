import { describe, expect, it } from "vitest";

import { mergeAlertRecipients } from "../../src/functions/lib/resolvers/alerts/resolveAlertRecipients";
import { MembershipStatus } from "../../src/functions/lib/prismaClient";

describe("mergeAlertRecipients", () => {
  const active = (membershipId: string, userId: string) => ({
    membershipId,
    membership: { userId, status: MembershipStatus.ACTIVE },
  });
  const inactive = (membershipId: string, userId: string) => ({
    membershipId,
    membership: { userId, status: MembershipStatus.INACTIVE },
  });

  it("dedupes with room > zone > lead precedence", () => {
    const merged = mergeAlertRecipients({
      room: [active("m1", "u1")],
      zone: [active("m1", "u1"), active("m2", "u2")],
      lead: [active("m2", "u2"), active("m3", "u3")],
    });

    expect(merged).toEqual([
      { membershipId: "m1", userId: "u1", source: "room" },
      { membershipId: "m2", userId: "u2", source: "zone" },
      { membershipId: "m3", userId: "u3", source: "lead" },
    ]);
  });

  it("skips inactive memberships", () => {
    const merged = mergeAlertRecipients({
      room: [inactive("m1", "u1")],
      zone: [active("m2", "u2")],
      lead: [],
    });

    expect(merged).toEqual([
      { membershipId: "m2", userId: "u2", source: "zone" },
    ]);
  });
});
