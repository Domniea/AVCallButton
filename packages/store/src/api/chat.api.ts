import { getApiClient } from "./client";

export type ChatThreadType = "EVENT_GROUP" | "ZONE" | "DM";

export type ChatMessage = {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
};

export type ChatThread = {
  id: string;
  type: ChatThreadType;
  workspaceId: string;
  eventId: string | null;
  zoneId: string | null;
  dmKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatInboxItem = {
  id: string;
  type: ChatThreadType;
  workspaceId: string;
  eventId: string | null;
  eventName: string | null;
  zoneId: string | null;
  zoneName: string | null;
  otherUserId: string | null;
  lastMessage: ChatMessage | null;
  lastReadMessageId: string | null;
  unreadCount: number;
  updatedAt: string;
};

export type ChatInboxResponse = {
  threads: ChatInboxItem[];
};

export type ListThreadMessagesParams = {
  limit?: number;
  /** Paginate older messages (exclusive cursor = message id). */
  before?: string;
  /** Poll newer messages (exclusive cursor = message id). */
  after?: string;
};

export type ListThreadMessagesResponse = {
  messages: ChatMessage[];
  hasMore: boolean;
};

export type MarkThreadReadResponse = {
  threadId: string;
  lastReadMessageId: string | null;
};

export type OpenDmInput = {
  workspaceId: string;
  eventId: string;
  otherUserId: string;
};

export async function fetchChatInbox(
  token: string,
  workspaceId: string,
  eventId: string,
): Promise<ChatInboxResponse> {
  const api = getApiClient();
  const res = await api.get<ChatInboxResponse>("/chat/inbox", {
    params: { workspaceId, eventId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function listThreadMessages(
  token: string,
  threadId: string,
  params: ListThreadMessagesParams = {},
): Promise<ListThreadMessagesResponse> {
  const api = getApiClient();
  const query: Record<string, string | number> = {};
  if (params.limit != null) query.limit = params.limit;
  if (params.before) query.before = params.before;
  if (params.after) query.after = params.after;

  const res = await api.get<ListThreadMessagesResponse>(
    `/chat/threads/${threadId}/messages`,
    {
      params: query,
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
}

export async function createThreadMessage(
  token: string,
  threadId: string,
  body: string,
): Promise<{ message: ChatMessage }> {
  const api = getApiClient();
  const res = await api.post<{ message: ChatMessage }>(
    `/chat/threads/${threadId}/messages`,
    { body },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function markThreadRead(
  token: string,
  threadId: string,
  messageId: string,
): Promise<MarkThreadReadResponse> {
  const api = getApiClient();
  const res = await api.post<MarkThreadReadResponse>(
    `/chat/threads/${threadId}/read`,
    { messageId },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function openDmThread(
  token: string,
  data: OpenDmInput,
): Promise<{ thread: ChatThread }> {
  const api = getApiClient();
  const res = await api.post<{ thread: ChatThread }>("/chat/dms", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
