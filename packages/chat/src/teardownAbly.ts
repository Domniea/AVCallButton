import type { Realtime } from "ably";

/**
 * Ably constructs "Connection closed" at `close()` and may reject in-flight
 * channel attaches later — Next's overlay attributes that to `close()`.
 * Suppress only that known teardown noise while we intentionally hang up.
 */
let suppressConnectionClosedDepth = 0;
let rejectionHandlerInstalled = false;

function installConnectionClosedSuppression() {
  if (rejectionHandlerInstalled || typeof window === "undefined") return;
  rejectionHandlerInstalled = true;
  window.addEventListener("unhandledrejection", (event) => {
    if (suppressConnectionClosedDepth <= 0) return;
    const reason = event.reason;
    const message =
      reason && typeof reason === "object" && "message" in reason
        ? String((reason as { message: unknown }).message)
        : String(reason);
    if (message === "Connection closed") {
      event.preventDefault();
    }
  });
}

function beginTeardownSuppression() {
  installConnectionClosedSuppression();
  suppressConnectionClosedDepth += 1;
  // Keep suppression briefly after close() so late attach rejects are covered.
  setTimeout(() => {
    suppressConnectionClosedDepth = Math.max(0, suppressConnectionClosedDepth - 1);
  }, 1000);
}

/** Unsubscribe + detach, then close — avoids racing an in-flight attach. */
export async function teardownAblyRealtime(
  realtime: Realtime,
  channelNames: string[],
  eventName: string,
): Promise<void> {
  beginTeardownSuppression();

  for (const name of channelNames) {
    try {
      const channel = realtime.channels.get(name);
      channel.unsubscribe(eventName);
      await channel.detach();
    } catch {
      // already detached / connection going away
    }
  }

  const state = realtime.connection.state;
  if (state === "closing" || state === "closed" || state === "failed") {
    return;
  }

  try {
    realtime.close();
  } catch {
    // ignore sync throw (rare); async reject is handled via suppression
  }
}

/** Defer teardown so React Strict Mode remount can settle first. */
export function scheduleAblyTeardown(
  realtime: Realtime | null | undefined,
  channelNames: string[],
  eventName: string,
  delayMs = 100,
): () => void {
  if (!realtime) return () => undefined;
  const timer = setTimeout(() => {
    void teardownAblyRealtime(realtime, channelNames, eventName);
  }, delayMs);
  return () => clearTimeout(timer);
}
