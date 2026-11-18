import type { AlertPriority } from "@prisma/client";

export type AlertBoardSortableRoom = {
  currentPriority: AlertPriority | null;
  name: string;
  drivingAlert: { createdAt: string } | null;
};

/** RED → YELLOW → GREEN; within band, oldest outstanding first; green by name. */
export function sortAlertBoardRooms<T extends AlertBoardSortableRoom>(
  rooms: T[],
): T[] {
  const band = (priority: AlertPriority | null) => {
    if (priority === "HIGH") return 0;
    if (priority === "MEDIUM") return 1;
    return 2;
  };

  return [...rooms].sort((a, b) => {
    const byBand = band(a.currentPriority) - band(b.currentPriority);
    if (byBand !== 0) return byBand;

    if (a.currentPriority === null && b.currentPriority === null) {
      return a.name.localeCompare(b.name);
    }

    const aCreated = a.drivingAlert?.createdAt ?? "";
    const bCreated = b.drivingAlert?.createdAt ?? "";
    if (aCreated !== bCreated) return aCreated.localeCompare(bCreated);

    return a.name.localeCompare(b.name);
  });
}
