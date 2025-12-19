import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 * This shape intentionally matches what Cognito / AWS will give us later
 */
export type AuthUser = {
  id: string
  email?: string
}

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'

type AuthState = {
  user: AuthUser | null
  status: AuthStatus
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authLoading(state) {
      state.status = 'loading'
    },
    authAuthenticated(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload
      state.status = 'authenticated'
    },
    authUnauthenticated(state) {
      state.user = null
      state.status = 'unauthenticated'
    },
  },
})

export const {
  authLoading,
  authAuthenticated,
  authUnauthenticated,
} = authSlice.actions

export const authReducer = authSlice.reducer
