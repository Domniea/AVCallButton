import AsyncStorage from "@react-native-async-storage/async-storage";

export const LAST_WORKSPACE_ID_KEY = "lastWorkspaceId";
export const LAST_EVENT_ID_KEY = "lastEventId";

export type LastSession = {
  workspaceId: string;
  eventId: string;
};

export async function getLastSession(): Promise<LastSession | null> {
  const [workspaceId, eventId] = await Promise.all([
    AsyncStorage.getItem(LAST_WORKSPACE_ID_KEY),
    AsyncStorage.getItem(LAST_EVENT_ID_KEY),
  ]);
  if (!workspaceId || !eventId) return null;
  return { workspaceId, eventId };
}

export async function setLastSession(
  workspaceId: string,
  eventId: string,
): Promise<void> {
  await AsyncStorage.multiSet([
    [LAST_WORKSPACE_ID_KEY, workspaceId],
    [LAST_EVENT_ID_KEY, eventId],
  ]);
}

export async function clearLastSession(): Promise<void> {
  await AsyncStorage.multiRemove([LAST_WORKSPACE_ID_KEY, LAST_EVENT_ID_KEY]);
}
