import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";

import type { RootState } from "@av/store";

import { LoadingScreen } from "../../../components/LoadingScreen";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { Text } from "../../../components/ui/layout";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { EventAlertList } from "../../event/EventAlertList";
import {
  getLastSession,
  type LastSession,
} from "../../lib/lastSession";

/** Alerts tab home: event-wide alert list for the selected event. */
export default function AlertsHome() {
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const { muted } = useThemeColors();
  const [session, setSession] = useState<LastSession | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void getLastSession()
        .then((next) => {
          if (!active) return;
          setSession(next);
          setSessionReady(true);
        })
        .catch((err) => {
          console.error("Failed to read last session:", err);
          if (!active) return;
          setSession(null);
          setSessionReady(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  if (authStatus === "idle" || authStatus === "loading" || !sessionReady) {
    return <LoadingScreen message="Checking session…" />;
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  if (!session) {
    return (
      <ScreenLayout title="Alerts" maxW="720">
        <Text fontSize="sm" color={muted}>
          No event selected. Pick an event from the Event tab first.
        </Text>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Alerts" maxW="720">
      <EventAlertList
        workspaceId={session.workspaceId}
        eventId={session.eventId}
        enabled={authStatus === "authenticated"}
      />
    </ScreenLayout>
  );
}
