import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAuthSession } from "aws-amplify/auth";

import {
  fetchMyEventDetail,
  fetchMyWorkspaceEvents,
  type MyEventDetail,
  type MyWorkspaceEventListItem,
} from "../api/me.api";

export type FetchMyWorkspaceEventsResult = {
  workspaceId: string;
  events: MyWorkspaceEventListItem[];
};

export const fetchMyWorkspaceEventsThunk = createAsyncThunk<
  FetchMyWorkspaceEventsResult,
  string,
  { rejectValue: string }
>("crewDash/fetchMyWorkspaceEvents", async (workspaceId, { rejectWithValue }) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) {
      return rejectWithValue("No session token");
    }
    const data = await fetchMyWorkspaceEvents(token, workspaceId);
    return { workspaceId, events: data.events };
  } catch (err) {
    console.error("fetchMyWorkspaceEventsThunk failed:", err);
    return rejectWithValue("Could not load your event assignments");
  }
});

export type FetchMyEventDetailResult = MyEventDetail & {
  eventId: string;
};

export const fetchMyEventDetailThunk = createAsyncThunk<
  FetchMyEventDetailResult,
  string,
  { rejectValue: string }
>("crewDash/fetchMyEventDetail", async (eventId, { rejectWithValue }) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) {
      return rejectWithValue("No session token");
    }
    const data = await fetchMyEventDetail(token, eventId);
    return { eventId, ...data };
  } catch (err) {
    console.error("fetchMyEventDetailThunk failed:", err);
    return rejectWithValue("Could not load your event coverage");
  }
});
