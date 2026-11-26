import { describe, expect, it } from "vitest";

import { sortEventAlerts } from "../../src/functions/lib/alerts/sortEventAlerts";

describe("sortEventAlerts", () => {
  const t = (iso: string) => new Date(iso);

  it("orders active HIGH before MEDIUM, oldest first within band", () => {
    const sorted = sortEventAlerts([
      {
        id: "m2",
        priority: "MEDIUM" as const,
        status: "OPEN",
        createdAt: t("2026-11-24T12:00:00Z"),
        resolvedAt: null,
      },
      {
        id: "h2",
        priority: "HIGH" as const,
        status: "OPEN",
        createdAt: t("2026-11-24T11:00:00Z"),
        resolvedAt: null,
      },
      {
        id: "h1",
        priority: "HIGH" as const,
        status: "ACKNOWLEDGED",
        createdAt: t("2026-11-24T10:00:00Z"),
        resolvedAt: null,
      },
      {
        id: "m1",
        priority: "MEDIUM" as const,
        status: "OPEN",
        createdAt: t("2026-11-24T09:00:00Z"),
        resolvedAt: null,
      },
    ]);

    expect(sorted.map((row) => row.id)).toEqual(["h1", "h2", "m1", "m2"]);
  });

  it("keeps active before resolved; resolved newest-first", () => {
    const sorted = sortEventAlerts([
      {
        id: "r-old",
        priority: "HIGH" as const,
        status: "RESOLVED",
        createdAt: t("2026-11-24T08:00:00Z"),
        resolvedAt: t("2026-11-24T09:00:00Z"),
      },
      {
        id: "open",
        priority: "MEDIUM" as const,
        status: "OPEN",
        createdAt: t("2026-11-24T12:00:00Z"),
        resolvedAt: null,
      },
      {
        id: "r-new",
        priority: "MEDIUM" as const,
        status: "RESOLVED",
        createdAt: t("2026-11-24T07:00:00Z"),
        resolvedAt: t("2026-11-24T13:00:00Z"),
      },
    ]);

    expect(sorted.map((row) => row.id)).toEqual(["open", "r-new", "r-old"]);
  });
});
