"use client";

import { useParams } from "next/navigation";

import { ChatNewDm } from "@/components/chat/ChatNewDm";

export default function CrewChatNewDmPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const eventId = params.eventId as string;

  return (
    <ChatNewDm
      workspaceId={workspaceId}
      eventId={eventId}
      chatBasePath={`/crew/workspace/${workspaceId}/event/${eventId}/chat`}
    />
  );
}
