import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAuthSession } from "aws-amplify/auth";

import { fetchEvents, type EventsListResponse } from "../api/events.api";

export type FetchEventsResult = EventsListResponse & {
  workspaceId: string;
};

export const fetchEventsThunk = createAsyncThunk<
  FetchEventsResult,
  string,
  { rejectValue: string }
>("events/fetchEvents", async (workspaceId, { rejectWithValue }) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) {
      return rejectWithValue("No session token");
    }
    const data = await fetchEvents(token, workspaceId);
    return { workspaceId, events: data.events };
  } catch (err) {
    console.error("fetchEventsThunk failed:", err);
    return rejectWithValue("Could not load events");
  }
});
