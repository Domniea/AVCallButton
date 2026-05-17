import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { logoutThunk } from "../auth/auth.thunks";
import { fetchWorkspacesThunk } from "./workspace.thunks";
import type { WorkspaceSummary } from "../api/workspaces.api";

export type WorkspaceFetchStatus = "idle" | "loading" | "succeeded" | "failed";

type WorkspaceState = {
  workspaces: WorkspaceSummary[];
  activeWorkspaceId: string | null;
  fetchStatus: WorkspaceFetchStatus;
  fetchError: string | null;
};

const initialState: WorkspaceState = {
  workspaces: [],
  activeWorkspaceId: null,
  fetchStatus: "idle",
  fetchError: null,
};

function pickActiveWorkspaceId(
  previousId: string | null,
  workspaces: WorkspaceSummary[],
): string | null {
  if (workspaces.length === 0) return null;
  const ids = new Set(workspaces.map((w) => w.workspaceId));
  if (previousId && ids.has(previousId)) return previousId;
  const personal = workspaces.find((w) => w.type === "personal");
  return personal?.workspaceId ?? workspaces[0]!.workspaceId;
}

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setActiveWorkspace(state, action: PayloadAction<string | null>) {
      state.activeWorkspaceId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspacesThunk.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchWorkspacesThunk.fulfilled, (state, action) => {
        state.workspaces = action.payload.workspaces;
        state.activeWorkspaceId = pickActiveWorkspaceId(
          state.activeWorkspaceId,
          action.payload.workspaces,
        );
        state.fetchStatus = "succeeded";
        state.fetchError = null;
      })
      .addCase(fetchWorkspacesThunk.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError = action.payload ?? "Could not load workspaces";
      })
      .addCase(logoutThunk.fulfilled, () => initialState);
  },
});

export const { setActiveWorkspace } = workspaceSlice.actions;
export const workspaceReducer = workspaceSlice.reducer;
