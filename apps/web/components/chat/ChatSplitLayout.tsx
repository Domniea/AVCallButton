"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Box, Text } from "@chakra-ui/react";

import type { RootState } from "@av/store";

import { ChatFrame } from "@/components/chat/ChatShell";
import { ChatInboxPanel } from "@/components/chat/ChatInboxPanel";

type ChatSplitLayoutProps = {
  workspaceId: string;
  eventId: string;
  chatBasePath: string;
  eventHref: string;
  children: ReactNode;
};

/**
 * Desktop: inbox | thread (or empty / new DM).
 * Mobile: inbox on `/chat`, thread/new alone with back to inbox.
 */
export function ChatSplitLayout({
  workspaceId,
  eventId,
  chatBasePath,
  eventHref,
  children,
}: ChatSplitLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const authStatus = useSelector((state: RootState) => state.auth.status);

  const isChatRoot =
    pathname === chatBasePath || pathname === `${chatBasePath}/`;

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [authStatus, router]);

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <Box
        minHeight="100vh"
        bg="bg"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.500">Checking session…</Text>
      </Box>
    );
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  return (
    <ChatFrame>
      <Box display="flex" flex={1} minH={0} h="100%">
        <Box
          w={{ base: "100%", md: "340px" }}
          flexShrink={0}
          borderRightWidth={{ base: 0, md: 1 }}
          borderRightColor="cardBorder"
          display={{ base: isChatRoot ? "flex" : "none", md: "flex" }}
          flexDir="column"
          minH={0}
        >
          <ChatInboxPanel
            workspaceId={workspaceId}
            eventId={eventId}
            chatBasePath={chatBasePath}
            eventHref={eventHref}
          />
        </Box>

        <Box
          flex={1}
          minW={0}
          minH={0}
          display={{ base: isChatRoot ? "none" : "flex", md: "flex" }}
          flexDir="column"
        >
          {children}
        </Box>
      </Box>
    </ChatFrame>
  );
}
