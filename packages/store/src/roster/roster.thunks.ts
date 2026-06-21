import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAuthSession } from "aws-amplify/auth";

import {
  assignStaff,
  AssignStaffData,
  fetchEventRoster,
  type EventRosterResponse,
} from "../api/roster.api";
import { withRetry } from "../api/retry";
import type { RootState } from "../createStore";

export type FetchRosterResult = EventRosterResponse & {
  eventId: string;
};

async function getIdToken(): Promise<string | null> {
  let session = await fetchAuthSession();
  let token = session.tokens?.idToken?.toString();
  if (token) return token;

  session = await fetchAuthSession({ forceRefresh: true });
  token = session.tokens?.idToken?.toString();
  return token ?? null;
}

export const fetchRosterThunk = createAsyncThunk<
  FetchRosterResult,
  string,
  { rejectValue: string; state: RootState }
>(
  "roster/fetchRoster",
  async (eventId, { rejectWithValue }) => {
    try {
      const token = await getIdToken();
      if (!token) {
        return rejectWithValue("No session token");
      }
      const data = await withRetry(() => fetchEventRoster(token, eventId), {
        attempts: 6,
        delayMs: 800,
      });
      return { eventId, ...data };
    } catch (err) {
      console.error("fetchRosterThunk failed:", err);
      return rejectWithValue("Could not load event roster");
    }
  },
  {
    condition: (eventId, { getState }) => {
      const { auth, roster } = getState();
      if (auth.status !== "authenticated" || auth.user == null) {
        return false;
      }
      if (roster.fetchStatus === "loading" && roster.eventId === eventId) {
        return false;
      }
      return true;
    },
  },
);

export const assignStaffThunk = createAsyncThunk<
  string,
  { eventId: string; data: AssignStaffData },
  { rejectValue: string }
>("roster/assignStaff", async ({ eventId, data }, { rejectWithValue }) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) {
      return rejectWithValue("No session token");
    }
    await assignStaff(token, eventId, data);
    return eventId;
  } catch (err) {
    console.error("assignStaffThunk failed:", err);
    return rejectWithValue("Could not assign staff");
  }
});