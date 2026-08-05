import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@av/store";
import { fetchEventsThunk, fetchRosterThunk } from "@av/store";

import { canAccessAdminDash } from "../lib/viewMode";

export function useEventScreenData(workspaceId: string, eventId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const rosterAutoRetriedRef = useRef(false);

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const event = useSelector((state: RootState) =>
    state.events.events.find((e) => e.id === eventId),
  );
  const eventsFetchStatus = useSelector(
    (state: RootState) => state.events.fetchStatus,
  );
  const roleRankValue = useSelector((state: RootState) => {
    const ws = state.workspace.workspaces.find(
      (w) => w.workspaceId === workspaceId,
    );
    return ws?.roleRank ?? 0;
  });
  /** Admin event/zone/room screens only — not the chat DM roster path. */
  const mayFetchRosterOnDash = canAccessAdminDash(roleRankValue);
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
    if (authStatus !== "authenticated" || !workspaceId) return;
    if (eventsFetchStatus === "idle") {
      void dispatch(fetchEventsThunk(workspaceId));
    }
  }, [authStatus, workspaceId, eventsFetchStatus, dispatch]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !authUser || !eventId) return;
    if (!mayFetchRosterOnDash) return;
    void dispatch(fetchRosterThunk(eventId));
  }, [authStatus, authUser, eventId, mayFetchRosterOnDash, dispatch]);

  useEffect(() => {
    rosterAutoRetriedRef.current = false;
  }, [eventId]);

  useEffect(() => {
    if (!mayFetchRosterOnDash) return;
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
  }, [mayFetchRosterOnDash, rosterFetchStatus, rosterEventId, eventId, dispatch]);

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
