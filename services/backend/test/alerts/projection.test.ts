import { describe, expect, it } from "vitest";

import {
  computeProjectionFromActiveAlerts,
  isActiveAlertStatus,
} from "../../src/functions/lib/alerts/projection";

describe("isActiveAlertStatus", () => {
  it("treats OPEN and ACKNOWLEDGED as active", () => {
    expect(isActiveAlertStatus("OPEN")).toBe(true);
    expect(isActiveAlertStatus("ACKNOWLEDGED")).toBe(true);
  });

  it("treats RESOLVED and other statuses as inactive", () => {
    expect(isActiveAlertStatus("RESOLVED")).toBe(false);
    expect(isActiveAlertStatus("CLOSED")).toBe(false);
    expect(isActiveAlertStatus("CANCELLED")).toBe(false);
  });
});

describe("computeProjectionFromActiveAlerts", () => {
  const t0 = new Date("2026-01-01T00:00:00.000Z");
  const t1 = new Date("2026-01-01T00:01:00.000Z");
  const t2 = new Date("2026-01-01T00:02:00.000Z");

  it("returns green (null) when there are no active alerts", () => {
    expect(computeProjectionFromActiveAlerts([])).toEqual({
      currentPriority: null,
      currentAlertId: null,
      activeAlertCount: 0,
    });
  });

  it("uses oldest HIGH as driving when HIGH and MEDIUM are mixed", () => {
    const result = computeProjectionFromActiveAlerts([
      { id: "m-new", priority: "MEDIUM", createdAt: t2 },
      { id: "h-old", priority: "HIGH", createdAt: t0 },
      { id: "h-new", priority: "HIGH", createdAt: t1 },
      { id: "m-old", priority: "MEDIUM", createdAt: t1 },
    ]);

    expect(result).toEqual({
      currentPriority: "HIGH",
      currentAlertId: "h-old",
      activeAlertCount: 4,
    });
  });

  it("uses oldest MEDIUM when no HIGH remains (partial resolve → yellow)", () => {
    const result = computeProjectionFromActiveAlerts([
      { id: "m-new", priority: "MEDIUM", createdAt: t2 },
      { id: "m-old", priority: "MEDIUM", createdAt: t0 },
    ]);

    expect(result).toEqual({
      currentPriority: "MEDIUM",
      currentAlertId: "m-old",
      activeAlertCount: 2,
    });
  });

  it("does not let a newer MEDIUM hide an older HIGH", () => {
    const result = computeProjectionFromActiveAlerts([
      { id: "m-latest", priority: "MEDIUM", createdAt: t2 },
      { id: "h-oldest", priority: "HIGH", createdAt: t0 },
    ]);

    expect(result.currentAlertId).toBe("h-oldest");
    expect(result.currentPriority).toBe("HIGH");
  });
});
