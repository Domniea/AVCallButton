import { createSlice } from "@reduxjs/toolkit";

import type {
  RosterAssignment,
  RosterPendingInvite,
} from "../api/roster.api";
import { logoutThunk } from "../auth/auth.thunks";
import { fetchRosterThunk } from "./roster.thunks";

export type RosterFetchStatus = "idle" | "loading" | "succeeded" | "failed";

type RosterState = {
  eventId: string | null;
  assignments: RosterAssignment[];
  pendingInvites: RosterPendingInvite[];
  fetchStatus: RosterFetchStatus;
  fetchError: string | null;
};

const initialState: RosterState = {
  eventId: null,
  assignments: [],
  pendingInvites: [],
  fetchStatus: "idle",
  fetchError: null,
};

const rosterSlice = createSlice({
  name: "roster",
  initialState,
  reducers: {
    clearRoster(state) {
      state.eventId = null;
      state.assignments = [];
      state.pendingInvites = [];
      state.fetchStatus = "idle";
      state.fetchError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRosterThunk.pending, (state, action) => {
        state.eventId = action.meta.arg;
        state.fetchStatus = "loading";
        state.fetchError = null;
        state.assignments = [];
        state.pendingInvites = [];
      })
      .addCase(fetchRosterThunk.fulfilled, (state, action) => {
        state.eventId = action.payload.eventId;
        state.assignments = action.payload.assignments;
        state.pendingInvites = action.payload.pendingInvites;
        state.fetchStatus = "succeeded";
        state.fetchError = null;
      })
      .addCase(fetchRosterThunk.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload ?? "Could not load event roster";
        state.assignments = [];
        state.pendingInvites = [];
      })
      .addCase(logoutThunk.fulfilled, () => initialState);
  },
});

export const { clearRoster } = rosterSlice.actions;
export const rosterReducer = rosterSlice.reducer;
