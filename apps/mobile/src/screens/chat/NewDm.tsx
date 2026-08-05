import React, { useCallback, useMemo, useState } from "react";
import { Text, VStack } from "native-base";
import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@av/store";
import { fetchRosterThunk, openDmThread } from "@av/store";

import { BaseCard } from "../../../components/BaseCard";
import { ListRow } from "../../../components/ListRow";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { getIdToken } from "../../lib/getIdToken";
import {
  getLastSession,
  type LastSession,
} from "../../lib/lastSession";
import type { ChatStackParamList } from "../../navigation/types";

type NewDmNav = NativeStackNavigationProp<ChatStackParamList, "newDm">;

/** Pick someone on the event roster and open (or reuse) a DM thread. */
export default function NewDmScreen() {
  const navigation = useNavigation<NewDmNav>();
  const dispatch = useDispatch<AppDispatch>();
  const { muted } = useThemeColors();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const myUserId = useSelector((state: RootState) => state.auth.user?.id);
  const assignments = useSelector(
    (state: RootState) => state.roster.assignments,
  );
  const rosterFetchStatus = useSelector(
    (state: RootState) => state.roster.fetchStatus,
  );

  const [session, setSession] = useState<LastSession | null>(null);
  const [openingUserId, setOpeningUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (authStatus !== "authenticated") return;
      void (async () => {
        const next = await getLastSession();
        setSession(next);
        if (next) {
          void dispatch(fetchRosterThunk(next.eventId));
        }
      })();
    }, [authStatus, dispatch]),
  );

  const candidates = useMemo(() => {
    const seen = new Set<string>();
    return assignments.filter((row) => {
      if (!row.userId || row.userId === myUserId) return false;
      if (seen.has(row.userId)) return false;
      seen.add(row.userId);
      return true;
    });
  }, [assignments, myUserId]);

  const onPick = useCallback(
    async (otherUserId: string, label: string) => {
      if (!session || openingUserId) return;
      setOpeningUserId(otherUserId);
      setError(null);
      try {
        const token = await getIdToken();
        if (!token) {
          setError("No session token");
          return;
        }
        const { thread } = await openDmThread(token, {
          workspaceId: session.workspaceId,
          eventId: session.eventId,
          otherUserId,
        });
        navigation.replace("chatThread", {
          threadId: thread.id,
          title: label,
        });
      } catch (err) {
        console.error("Failed to open DM:", err);
        setError("Could not open direct message");
      } finally {
        setOpeningUserId(null);
      }
    },
    [session, openingUserId, navigation],
  );

  if (authStatus === "idle" || authStatus === "loading") {
    return <LoadingScreen message="Checking session…" />;
  }

  if (!session) {
    return (
      <ScreenLayout title="New message" maxW="640">
        <BaseCard variant="outline">
          <Text fontSize="sm" color={muted}>
            No event selected. Pick an event from the Event tab first.
          </Text>
        </BaseCard>
      </ScreenLayout>
    );
  }

  if (rosterFetchStatus === "loading" && candidates.length === 0) {
    return <LoadingScreen message="Loading roster…" />;
  }

  return (
    <ScreenLayout
      title="New message"
      subtitle="People on this event"
      maxW="640"
    >
      {error ? (
        <BaseCard variant="outline">
          <Text fontSize="sm" color={muted}>
            {error}
          </Text>
        </BaseCard>
      ) : null}

      {candidates.length === 0 ? (
        <BaseCard variant="outline">
          <Text fontSize="sm" color={muted}>
            No one else is on this event roster yet.
          </Text>
        </BaseCard>
      ) : (
        <VStack space={3}>
          {candidates.map((row) => {
            const label = row.email ?? row.roleName ?? "Teammate";
            const busy = openingUserId === row.userId;
            return (
              <ListRow
                key={row.userId}
                title={label}
                subtitle={row.roleName}
                meta={busy ? "Opening…" : undefined}
                onPress={
                  openingUserId
                    ? undefined
                    : () => void onPick(row.userId, label)
                }
              />
            );
          })}
        </VStack>
      )}
    </ScreenLayout>
  );
}
