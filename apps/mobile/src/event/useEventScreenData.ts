import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { AppDispatch, RootState } from "@av/store";
import { fetchEventsThunk, fetchRosterThunk } from "@av/store";
import type { RootStackParamList } from "../navigation/types";

type EventNav = NativeStackNavigationProp<RootStackParamList>;

export function useEventScreenData(workspaceId: string, eventId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<EventNav>();
  const rosterAutoRetriedRef = useRef(false);

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const event = useSelector((state: RootState) =>
    state.events.events.find((e) => e.id === eventId),
  );
  const eventsFetchStatus = useSelector(
    (state: RootState) => state.events.fetchStatus,
  );
  const assignments = useSelector(
    (state: RootState) => state.roster.assignments,
  );
  const pendingInvites = useSelector(
    (state: RootState) => state.roster.pendingInvites,
  );
  const rosterEventId = useSelector((state: RootState) => state.roster.eventId);
  const rosterFetchStatus = useSelector(
    (state: RootState) => state.roster.fetchStatus,
  );
  const rosterFetchError = useSelector(
    (state: RootState) => state.roster.fetchError,
  );

  const rosterMatchesEvent =
    rosterEventId === eventId && rosterFetchStatus === "succeeded";

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigation.replace("login");
    }
  }, [authStatus, navigation]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !workspaceId) return;
    if (eventsFetchStatus === "idle") {
      void dispatch(fetchEventsThunk(workspaceId));
    }
  }, [authStatus, workspaceId, eventsFetchStatus, dispatch]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !authUser || !eventId) return;
    void dispatch(fetchRosterThunk(eventId));
  }, [authStatus, authUser, eventId, dispatch]);

  useEffect(() => {
    rosterAutoRetriedRef.current = false;
  }, [eventId]);

  useEffect(() => {
    if (
      rosterFetchStatus !== "failed" ||
      rosterEventId !== eventId ||
      rosterAutoRetriedRef.current
    ) {
      return;
    }
    rosterAutoRetriedRef.current = true;
    const timer = setTimeout(() => {
      void dispatch(fetchRosterThunk(eventId));
    }, 1500);
    return () => clearTimeout(timer);
  }, [rosterFetchStatus, rosterEventId, eventId, dispatch]);

  return {
    authStatus,
    event,
    eventsFetchStatus,
    assignments,
    pendingInvites,
    rosterMatchesEvent,
    rosterFetchStatus,
    rosterFetchError,
    dispatch,
  };
}
