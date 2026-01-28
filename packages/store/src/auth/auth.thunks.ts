// import { createAsyncThunk } from "@reduxjs/toolkit";
// import {
//   login as amplifyLogin,
//   logout as amplifyLogout,
// } from "@av/auth-client";
// import { getCurrentUser } from "aws-amplify/auth";
// import type { AppUser } from "./authSlice";
// import { fetchMe } from "./auth.api";
// import { fetchAuthSession } from "aws-amplify/auth";

// export const loginThunk = createAsyncThunk<
//   AppUser,
//   { email: string; password: string },
//   { rejectValue: string }
// >("auth/login", async ({ email, password }, { rejectWithValue }) => {
//   try {
//     await amplifyLogin(email, password);

//     const user = await getCurrentUser();

//     return {
//       id: user.userId,
//       email,
//     };
//   } catch (err) {
//     console.error("loginThunk failed", err);
//     return rejectWithValue("Invalid credentials");
//   }
// });

// export const fetchMeThunk = createAsyncThunk<
//   AppUser,
//   void,
//   { rejectValue: string }
// >("auth/fetchMe", async (_, { rejectWithValue }) => {
//   try {

//     const session = await fetchAuthSession();

//     const token = session.tokens?.accessToken?.toString();

//     if (!token) {
//       return rejectWithValue("No access token");
//     }

//     const me = await fetchMe(token);

//     return {
//       id: me.id,
//       email: me.email,
//     };
//   } catch (err) {
//     console.error("fetchMeThunk failed", err);
//     return rejectWithValue("Unauthorized");
//   }
// });

// export const rehydrateAuthThunk = createAsyncThunk<
//   AppUser,
//   void,
//   { rejectValue: string }
// >("auth/rehydrate", async (_, { rejectWithValue }) => {
//   try {
//     const user = await getCurrentUser();

//     const email = user.signInDetails?.loginId;

//     if (!email) {
//       throw new Error("Authenticated user missing email");
//     }

//     return {
//       id: user.userId,
//       email,
//     };
//   } catch (err) {
//     return rejectWithValue("No active session");
//   }
// });

// export const logoutThunk = createAsyncThunk<
//   void,
//   void,
//   { rejectValue: string }
// >("auth/logout", async () => {
//   try {
//     await amplifyLogout();
//   } catch (err) {
//     console.error("logout failed", err);
//     if (err) throw new Error("Logout failed");
//   }
// });



import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  login as amplifyLogin,
  logout as amplifyLogout,
} from "@av/auth-client";
import { fetchAuthSession } from "aws-amplify/auth";
import { fetchMe } from "./auth.api";
import type { AppUser } from "./authSlice";

export const loginThunk = createAsyncThunk<
  void,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
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
    console.error("fetchMeThunk failed", err);
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

export const rehydrateAuthThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/rehydrate", async (_, { rejectWithValue }) => {
  try {
    const session = await fetchAuthSession();
    if (!session.tokens?.accessToken) {
      return rejectWithValue("No active session");
    }
  } catch {
    return rejectWithValue("No active session");
  }
});
