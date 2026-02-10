import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  login as amplifyLogin,
  logout as amplifyLogout,
  normalizeAuthState,
} from "@av/auth-client";
import { fetchAuthSession } from "aws-amplify/auth";
import { fetchMe } from "./auth.api";
import type { AppUser } from "./authSlice";

// //FIRST
// export const loginThunk = createAsyncThunk<
//   void,
//   { email: string; password: string },
//   { rejectValue: string }
// >("auth/login", async ({ email, password }, { rejectWithValue }) => {
//   try {
//     await amplifyLogin(email, password);
//   } catch (err) {
//     console.error("loginThunk failed", err);
//     return rejectWithValue("Invalid credentials");
//   }
// });


export const loginThunk = createAsyncThunk<
  void,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    await normalizeAuthState();
    await amplifyLogin(email, password);
  } catch (err) {
    console.error("loginThunk failed", err);
    return rejectWithValue("Invalid credentials");
  }
});



export const fetchMeThunk = createAsyncThunk<
  AppUser,
  void,
  { rejectValue: string }
>("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const session = await fetchAuthSession();

    const token = session.tokens?.idToken?.toString();

    if (!token) {
      return rejectWithValue("No access token");
    }
    const me = await fetchMe(token);

    return me;
  } catch (err) {
    await normalizeAuthState();
    return rejectWithValue("Unauthorized");
  }
});

export const logoutThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async () => {
  await amplifyLogout();
});

//FIRST
// export const rehydrateAuthThunk = createAsyncThunk<
//   void,
//   void,
//   { rejectValue: string }
// >("auth/rehydrate", async (_, { rejectWithValue }) => {
//   try {
//     const session = await fetchAuthSession();
//     if (!session.tokens?.accessToken) {
//       return rejectWithValue("No active session");
//     }
//   } catch {
//     return rejectWithValue("No active session");
//   }
// });


export const rehydrateAuthThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/rehydrate", async (_, { rejectWithValue }) => {
  try {
    await fetchAuthSession();
  } catch {
    await normalizeAuthState();
    return rejectWithValue("No active session");
  }
});

