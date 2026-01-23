import { createAsyncThunk } from "@reduxjs/toolkit";
import { login as amplifyLogin } from "@av/auth-client";
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
  } catch {
    return rejectWithValue("No active session");
  }
});
