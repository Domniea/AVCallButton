import { getIdToken } from "@av/auth-client";
import type { EventAlertListResponse } from "@av/store";
import { fetchEventAlerts } from "@av/store";

type BadgeListener = (count: number) => void;
type ListListener = (eventId: string, data: EventAlertListResponse) => void;

type FetchTicket = {
  /** Bumps on every local/optimistic write — stale fetches must not overwrite. */
  localEpoch: number;
  fetchId: number;
};

let activeCount = 0;
let localEpoch = 0;
let nextFetchId = 0;
let lastAppliedFetchId = 0;

let cachedEventId: string | null = null;
let cachedList: EventAlertListResponse | null = null;

const badgeListeners = new Set<BadgeListener>();
const listListeners = new Set<ListListener>();

function emitBadge(count: number) {
  badgeListeners.forEach((listener) => {
    try {
      listener(count);
    } catch (err) {
      console.error("alert badge listener failed:", err);
    }
  });
}

function emitList(eventId: string, data: EventAlertListResponse) {
  listListeners.forEach((listener) => {
    try {
      listener(eventId, data);
    } catch (err) {
      console.error("alert list listener failed:", err);
    }
  });
}

function applyBadge(count: number) {
  const next = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  activeCount = next;
  emitBadge(next);
}

/** Optimistic / local badge write — invalidates in-flight fetches. */
export function publishAlertBadgeCount(count: number) {
  localEpoch += 1;
  applyBadge(count);
}

export function getAlertBadgeCount(): number {
  return activeCount;
}

export function getCachedEventAlerts(
  eventId: string,
): EventAlertListResponse | null {
  return cachedEventId === eventId ? cachedList : null;
}

export function subscribeAlertBadgeCount(listener: BadgeListener): () => void {
  badgeListeners.add(listener);
  try {
    listener(activeCount);
  } catch (err) {
    console.error("alert badge subscriber failed:", err);
  }
  return () => {
    badgeListeners.delete(listener);
  };
}

/** List UI can stay fresh while the Alerts tab is in the background. */
export function subscribeAlertList(listener: ListListener): () => void {
  listListeners.add(listener);
  if (cachedEventId && cachedList) {
    try {
      listener(cachedEventId, cachedList);
    } catch (err) {
      console.error("alert list subscriber failed:", err);
    }
  }
  return () => {
    listListeners.delete(listener);
  };
}

export function beginAlertFetch(): FetchTicket {
  nextFetchId += 1;
  return { localEpoch, fetchId: nextFetchId };
}

function shouldApplyFetch(ticket: FetchTicket): boolean {
  if (ticket.localEpoch !== localEpoch) return false;
  if (ticket.fetchId < lastAppliedFetchId) return false;
  return true;
}

function cacheAndPublishFetch(
  eventId: string,
  data: EventAlertListResponse,
  ticket: FetchTicket,
) {
  if (!shouldApplyFetch(ticket)) return false;
  lastAppliedFetchId = ticket.fetchId;
  cachedEventId = eventId;
  cachedList = data;
  applyBadge(data.counts?.active ?? 0);
  emitList(eventId, data);
  return true;
}

/** Fetch alerts, update cache + badge if this response is still current. */
export async function fetchAndSyncEventAlerts(
  eventId: string,
): Promise<EventAlertListResponse | null> {
  const ticket = beginAlertFetch();
  try {
    const token = await getIdToken();
    if (!token) {
      if (shouldApplyFetch(ticket)) {
        localEpoch += 1;
        applyBadge(0);
      }
      return null;
    }
    const data = await fetchEventAlerts(token, eventId);
    const normalized: EventAlertListResponse = {
      counts: data.counts ?? {
        active: 0,
        pending: 0,
        urgent: 0,
        resolved: 0,
        all: 0,
      },
      alerts: Array.isArray(data.alerts) ? data.alerts : [],
    };
    cacheAndPublishFetch(eventId, normalized, ticket);
    return normalized;
  } catch (err) {
    console.error("Failed to sync event alerts:", err);
    throw err;
  }
}

/** Re-fetch after room resolve (respects optimistic badge epoch). */
export async function refreshAlertBadgeCount(eventId: string): Promise<void> {
  try {
    await fetchAndSyncEventAlerts(eventId);
  } catch {
    // keep last published total
  }
}
