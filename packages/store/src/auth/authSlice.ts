import { createSlice } from '@reduxjs/toolkit'
import { loginThunk, rehydrateAuthThunk, logoutThunk } from './auth.thunks'


export type AuthUser = {
  id: string
  email: string
}

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'

type AuthState = {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
  },

  extraReducers: (builder) => {
    builder

      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.user = null
        state.status = 'unauthenticated'
        state.error = action.payload ?? 'Login failed'
      })

      .addCase(rehydrateAuthThunk.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(rehydrateAuthThunk.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'authenticated'
      })
      .addCase(rehydrateAuthThunk.rejected, (state) => {
        state.user = null
        state.status = 'unauthenticated'
        state.error = null

      })

      .addCase(logoutThunk.pending, (state) => {
        state.status = 'loading',
        state.error = null
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null
        state.status = 'unauthenticated'
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.user = null
        state.status = 'unauthenticated'
        state.error = null
      })
  },
})

// export const { authUnauthenticated } = authSlice.actions
export const authReducer = authSlice.reducer
