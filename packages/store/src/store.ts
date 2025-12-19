import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from './slices/authSlice'

export const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // future AWS tokens
      }),
  })

export type AppStore = ReturnType<typeof createStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
