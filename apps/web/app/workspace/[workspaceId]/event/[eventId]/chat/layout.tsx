"use client";

import { useParams } from "next/navigation";

import { ChatSplitLayout } from "@/components/chat/ChatSplitLayout";

export default function AdminChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const eventId = params.eventId as string;

  return (
    <ChatSplitLayout
      workspaceId={workspaceId}
      eventId={eventId}
      chatBasePath={`/workspace/${workspaceId}/event/${eventId}/chat`}
      eventHref={`/workspace/${workspaceId}/event/${eventId}`}
    >
      {children}
    </ChatSplitLayout>
  );
}
