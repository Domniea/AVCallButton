import { createSlice } from "@reduxjs/toolkit";
import {
  loginThunk,
  rehydrateAuthThunk,
  logoutThunk,
  fetchMeThunk,
} from "./auth.thunks";

export type AppUser = {
  id: string;
  email: string;
};

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

type AuthState = {
  user: AppUser | null;
  status: AuthStatus;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state) => {
        state.status = "authenticated";
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "unauthenticated";
        state.error = action.payload ?? "Login failed";
      })

      .addCase(rehydrateAuthThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(rehydrateAuthThunk.fulfilled, (state) => {
        state.status = "authenticated";
      })
      .addCase(rehydrateAuthThunk.rejected, (state) => {
        state.status = "unauthenticated";
      })

      .addCase(fetchMeThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
        state.error = null;
      })
      .addCase(fetchMeThunk.rejected, (state, action) => {
        state.user = null;
        state.status = "unauthenticated";
        state.error = action.payload ?? "Session expired";
      })

      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.status = "unauthenticated";
        state.error = null;
      });
  },
});

export const authReducer = authSlice.reducer;
