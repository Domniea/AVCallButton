import { createAsyncThunk } from "@reduxjs/toolkit";
import { getIdToken } from "@av/auth-client";

import {
  createEvent,
  deleteEvent,
  fetchEvents,
  type CreateEventInput,
  type EventsListResponse,
} from "../api/events.api";
import type { RootState } from "../createStore";

export type FetchEventsResult = EventsListResponse & {
  workspaceId: string;
};

export type CreateEventArgs = {
  workspaceId: string;
  data: CreateEventInput;
};

export type DeleteEventArgs = {
  workspaceId: string;
  eventId: string;
};

export const fetchEventsThunk = createAsyncThunk<
  FetchEventsResult,
  string,
  { rejectValue: string }
>("events/fetchEvents", async (workspaceId, { rejectWithValue }) => {
  try {
    const token = await getIdToken();
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

export const createEventThunk = createAsyncThunk<
  { workspaceId: string; event: EventsListResponse["events"][number] },
  CreateEventArgs,
  { rejectValue: string; state: RootState }
>(
  "events/createEvent",
  async ({ workspaceId, data }, { rejectWithValue }) => {
    try {
      const token = await getIdToken();
      if (!token) {
        return rejectWithValue("No session token");
      }
      const { event } = await createEvent(token, workspaceId, data);
      return { workspaceId, event };
    } catch (err) {
      console.error("createEventThunk failed:", err);
      return rejectWithValue("Could not create show");
    }
  },
  {
    condition: (_, { getState }) => {
      const { auth } = getState();
      return auth.status === "authenticated" && auth.user != null;
    },
  },
);

export const deleteEventThunk = createAsyncThunk<
  DeleteEventArgs,
  DeleteEventArgs,
  { rejectValue: string; state: RootState }
>(
  "events/deleteEvent",
  async ({ workspaceId, eventId }, { rejectWithValue }) => {
    try {
      const token = await getIdToken();
      if (!token) {
        return rejectWithValue("No session token");
      }
      await deleteEvent(token, eventId);
      return { workspaceId, eventId };
    } catch (err) {
      console.error("deleteEventThunk failed:", err);
      return rejectWithValue("Could not delete event");
    }
  },
  {
    condition: (_, { getState }) => {
      const { auth } = getState();
      return auth.status === "authenticated" && auth.user != null;
    },
  },
);
