"use client";

import { useParams } from "next/navigation";

import { ChatSplitLayout } from "@/components/chat/ChatSplitLayout";

export default function CrewChatLayout({
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
      chatBasePath={`/crew/workspace/${workspaceId}/event/${eventId}/chat`}
      eventHref={`/crew/workspace/${workspaceId}/event/${eventId}`}
    >
      {children}
    </ChatSplitLayout>
  );
}
