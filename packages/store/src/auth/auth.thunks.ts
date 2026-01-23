import { createAsyncThunk } from "@reduxjs/toolkit";
import { login as amplifyLogin, logout as amplifyLogout} from "@av/auth-client";
import { getCurrentUser } from "aws-amplify/auth";
import type { AuthUser } from "./authSlice";

export const loginThunk = createAsyncThunk<
  AuthUser,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    await amplifyLogin(email, password);

    const user = await getCurrentUser();

    return {
      id: user.userId,
      email,
    };
  } catch (err) {
    console.error("loginThunk failed", err);
    return rejectWithValue("Invalid credentials");
  }
});

export const rehydrateAuthThunk = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string }
>("auth/rehydrate", async (_, { rejectWithValue }) => {
  try {
    const user = await getCurrentUser();

    const email = user.signInDetails?.loginId

    if (!email) {
      throw new Error("Authenticated user missing email");
    }

    return {
      id: user.userId,
      email
    };
  } catch (err){
    return rejectWithValue("No active session");
  }
});

export const logoutThunk = createAsyncThunk<
  void,
  void,
  {rejectValue: string}
  >("auth/logout", async () => {
    try {
      await amplifyLogout()
    } catch (err) {
      console.error( 'logout failed', err)
      if(err) throw new Error( "Logout failed" )
    }
  })