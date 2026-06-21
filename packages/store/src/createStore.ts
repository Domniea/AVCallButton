import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./auth/authSlice";
import { workspaceReducer } from "./workspace/workspaceSlice";
import { eventsReducer } from "./events/eventsSlice";
import { rosterReducer } from "./roster/rosterSlice";
import { crewDashReducer } from "./crewDash/crewDashSlice";

export const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      workspace: workspaceReducer,
      events: eventsReducer,
      roster: rosterReducer,
      crewDash: crewDashReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });

export type AppStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
