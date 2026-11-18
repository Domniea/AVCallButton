import { describe, expect, it } from "vitest";

import { sortAlertBoardRooms } from "../../src/functions/lib/alerts/sortAlertBoardRooms";

describe("sortAlertBoardRooms", () => {
  it("sorts RED → YELLOW → GREEN, oldest outstanding first within band", () => {
    const sorted = sortAlertBoardRooms([
      {
        name: "Clear B",
        currentPriority: null,
        drivingAlert: null,
      },
      {
        name: "Yellow late",
        currentPriority: "MEDIUM",
        drivingAlert: { createdAt: "2026-01-01T02:00:00.000Z" },
      },
      {
        name: "Red late",
        currentPriority: "HIGH",
        drivingAlert: { createdAt: "2026-01-01T02:00:00.000Z" },
      },
      {
        name: "Clear A",
        currentPriority: null,
        drivingAlert: null,
      },
      {
        name: "Yellow early",
        currentPriority: "MEDIUM",
        drivingAlert: { createdAt: "2026-01-01T01:00:00.000Z" },
      },
      {
        name: "Red early",
        currentPriority: "HIGH",
        drivingAlert: { createdAt: "2026-01-01T01:00:00.000Z" },
      },
    ]);

    expect(sorted.map((room) => room.name)).toEqual([
      "Red early",
      "Red late",
      "Yellow early",
      "Yellow late",
      "Clear A",
      "Clear B",
    ]);
  });
});
