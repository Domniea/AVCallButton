import { createSlice } from "@reduxjs/toolkit";

import type { MyEventDetail, MyWorkspaceEventListItem } from "../api/me.api";
import { logoutThunk } from "../auth/auth.thunks";
import {
  fetchMyEventDetailThunk,
  fetchMyWorkspaceEventsThunk,
} from "./crewDash.thunks";

export type CrewDashFetchStatus = "idle" | "loading" | "succeeded" | "failed";

type CrewDashState = {
  workspaceId: string | null;
  listEvents: MyWorkspaceEventListItem[];
  listStatus: CrewDashFetchStatus;
  listError: string | null;

  eventId: string | null;
  eventDetail: MyEventDetail | null;
  detailStatus: CrewDashFetchStatus;
  detailError: string | null;
};

const initialState: CrewDashState = {
  workspaceId: null,
  listEvents: [],
  listStatus: "idle",
  listError: null,

  eventId: null,
  eventDetail: null,
  detailStatus: "idle",
  detailError: null,
};

const crewDashSlice = createSlice({
  name: "crewDash",
  initialState,
  reducers: {
    clearCrewDash(state) {
      state.workspaceId = null;
      state.listEvents = [];
      state.listStatus = "idle";
      state.listError = null;
      state.eventId = null;
      state.eventDetail = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
    clearCrewDashDetail(state) {
      state.eventId = null;
      state.eventDetail = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyWorkspaceEventsThunk.pending, (state, action) => {
        state.workspaceId = action.meta.arg;
        state.listStatus = "loading";
        state.listError = null;
        state.listEvents = [];
      })
      .addCase(fetchMyWorkspaceEventsThunk.fulfilled, (state, action) => {
        state.workspaceId = action.payload.workspaceId;
        state.listEvents = action.payload.events;
        state.listStatus = "succeeded";
        state.listError = null;
      })
      .addCase(fetchMyWorkspaceEventsThunk.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          action.payload ?? "Could not load your event assignments";
        state.listEvents = [];
      })
      .addCase(fetchMyEventDetailThunk.pending, (state, action) => {
        state.eventId = action.meta.arg;
        state.detailStatus = "loading";
        state.detailError = null;
        state.eventDetail = null;
      })
      .addCase(fetchMyEventDetailThunk.fulfilled, (state, action) => {
        const { eventId, ...detail } = action.payload;
        state.eventId = eventId;
        state.eventDetail = detail;
        state.detailStatus = "succeeded";
        state.detailError = null;
      })
      .addCase(fetchMyEventDetailThunk.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError =
          action.payload ?? "Could not load your event coverage";
        state.eventDetail = null;
      })
      .addCase(logoutThunk.fulfilled, () => initialState);
  },
});

export const { clearCrewDash, clearCrewDashDetail } = crewDashSlice.actions;
export const crewDashReducer = crewDashSlice.reducer;
