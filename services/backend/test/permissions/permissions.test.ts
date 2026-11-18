import { describe, expect, it } from "vitest";

import {
  hasPermission,
  hasPermissionForRank,
  isRole,
  parseWorkspaceRoleRank,
  roleKeyFromRank,
  roleRank,
} from "../../src/functions/lib/permissions";

describe("permissions", () => {
  it("maps ranks to role keys", () => {
    expect(roleKeyFromRank(roleRank.owner)).toBe("owner");
    expect(roleKeyFromRank(roleRank.crew)).toBe("crew");
    expect(roleKeyFromRank(3)).toBeNull();
  });

  it("validates role strings and ranks", () => {
    expect(isRole("lead")).toBe(true);
    expect(isRole("boss")).toBe(false);
    expect(parseWorkspaceRoleRank(6)).toBe(6);
    expect(parseWorkspaceRoleRank("8")).toBe(8);
    expect(parseWorkspaceRoleRank(7)).toBeNull();
    expect(parseWorkspaceRoleRank("nope")).toBeNull();
  });

  it("enforces action minimum ranks", () => {
    expect(hasPermissionForRank(roleRank.crew, "event:create")).toBe(false);
    expect(hasPermissionForRank(roleRank.lead, "event:create")).toBe(true);
    expect(hasPermissionForRank(roleRank.manager, "event:delete")).toBe(true);
    expect(hasPermissionForRank(roleRank.lead, "event:delete")).toBe(false);
    expect(hasPermission("owner", "workspace:delete")).toBe(true);
    expect(hasPermission("manager", "workspace:delete")).toBe(false);
  });
});
