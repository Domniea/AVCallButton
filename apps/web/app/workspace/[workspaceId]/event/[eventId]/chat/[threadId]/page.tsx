"use client";

import { useParams, useSearchParams } from "next/navigation";

import { ChatThread } from "@/components/chat/ChatThread";

export default function AdminChatThreadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceId = params.workspaceId as string;
  const eventId = params.eventId as string;
  const threadId = params.threadId as string;
  const title = searchParams.get("title");

  return (
    <ChatThread
      threadId={threadId}
      eventId={eventId}
      title={title}
      chatBasePath={`/workspace/${workspaceId}/event/${eventId}/chat`}
    />
  );
}
