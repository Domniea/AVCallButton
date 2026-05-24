import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAuthSession } from "aws-amplify/auth";

import {
  assignStaff,
  AssignStaffData,
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