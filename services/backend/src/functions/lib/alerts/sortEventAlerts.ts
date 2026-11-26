import { AlertPriority } from "../prismaClient";

type SortableAlert = {
  priority: (typeof AlertPriority)[keyof typeof AlertPriority];
  status: string;
  createdAt: Date;
  resolvedAt: Date | null;
};

function isActiveStatus(status: string): boolean {
  return status === "OPEN" || status === "ACKNOWLEDGED";
}

function priorityRank(priority: SortableAlert["priority"]): number {
  return priority === AlertPriority.HIGH ? 0 : 1;
}

/** Active first (HIGH → MEDIUM, oldest first); then resolved (newest resolve first). */
export function sortEventAlerts<T extends SortableAlert>(alerts: T[]): T[] {
  return [...alerts].sort((a, b) => {
    const aActive = isActiveStatus(a.status);
    const bActive = isActiveStatus(b.status);
    if (aActive !== bActive) return aActive ? -1 : 1;

    if (aActive && bActive) {
      const byPriority = priorityRank(a.priority) - priorityRank(b.priority);
      if (byPriority !== 0) return byPriority;
      return a.createdAt.getTime() - b.createdAt.getTime();
    }

    const aResolved = a.resolvedAt?.getTime() ?? 0;
    const bResolved = b.resolvedAt?.getTime() ?? 0;
    return bResolved - aResolved;
  });
}
