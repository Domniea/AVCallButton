import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAuthSession } from "aws-amplify/auth";

import {
  fetchEventRoster,
  type EventRosterResponse,
} from "../api/roster.api";

export type FetchRosterResult = EventRosterResponse & {
  eventId: string;
};

export const fetchRosterThunk = createAsyncThunk<
  FetchRosterResult,
  string,
  { rejectValue: string }
>("roster/fetchRoster", async (eventId, { rejectWithValue }) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) {
      return rejectWithValue("No session token");
    }
    const data = await fetchEventRoster(token, eventId);
    return { eventId, ...data };
  } catch (err) {
    console.error("fetchRosterThunk failed:", err);
    return rejectWithValue("Could not load event roster");
  }
});
