import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAuthSession } from "aws-amplify/auth";

import {
  fetchWorkspaces,
  type WorkspacesListResponse,
} from "../api/workspaces.api";

export const fetchWorkspacesThunk = createAsyncThunk<
  WorkspacesListResponse,
  void,
  { rejectValue: string }
>("workspace/fetchWorkspaces", async (_, { rejectWithValue }) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) {
      return rejectWithValue("No session token");
    }
    return await fetchWorkspaces(token);
  } catch (err) {
    console.error("fetchWorkspacesThunk failed:", err);
    return rejectWithValue("Could not load workspaces");
  }
});
