import { createSlice } from "@reduxjs/toolkit";

import { logoutThunk } from "../auth/auth.thunks";
import { fetchEventsThunk, createEventThunk } from "./events.thunks";
import type { EventSummary } from "../api/events.api";

export type EventsFetchStatus = "idle" | "loading" | "succeeded" | "failed";

type EventsState = {
  workspaceId: string | null;
  events: EventSummary[];
  fetchStatus: EventsFetchStatus;
  fetchError: string | null;
};

const initialState: EventsState = {
  workspaceId: null,
  events: [],
  fetchStatus: "idle",
  fetchError: null,
};

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearEvents(state) {
      state.workspaceId = null;
      state.events = [];
      state.fetchStatus = "idle";
      state.fetchError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventsThunk.pending, (state, action) => {
        state.workspaceId = action.meta.arg;
        state.fetchStatus = "loading";
        state.fetchError = null;
        state.events = [];
      })
      .addCase(fetchEventsThunk.fulfilled, (state, action) => {
        state.workspaceId = action.payload.workspaceId;
        state.events = action.payload.events;
        state.fetchStatus = "succeeded";
        state.fetchError = null;
      })
      .addCase(fetchEventsThunk.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload ?? "Could not load events";
        state.events = [];
      })
      .addCase(createEventThunk.fulfilled, (state, action) => {
        const { workspaceId, event } = action.payload;
        if (state.workspaceId === workspaceId) {
          state.events = [event, ...state.events];
          state.fetchStatus = "succeeded";
          state.fetchError = null;
        }
      })
      .addCase(logoutThunk.fulfilled, () => initialState);
  },
});

export const { clearEvents } = eventsSlice.actions;
export const eventsReducer = eventsSlice.reducer;
