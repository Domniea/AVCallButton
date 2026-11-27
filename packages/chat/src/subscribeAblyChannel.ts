import type { Message, Realtime } from "ably";

/**
 * Ably v2 `subscribe()` returns a Promise — must be awaited/caught or RN
 * reports an uncaught rejection (often as "undefined is not a function").
 */
export async function subscribeAblyChannel(
  client: Realtime,
  channelName: string,
  eventName: string,
  onMessage: (message: Message) => void,
): Promise<void> {
  await client.channels.get(channelName).subscribe(eventName, onMessage);
}
