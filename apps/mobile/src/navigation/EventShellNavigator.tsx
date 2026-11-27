import React from "react";

import { AppDrawer } from "./AppDrawer";
import { EventDrawerProvider } from "./EventDrawerContext";
import MainTabNavigator from "./MainTabNavigator";

/** Post-event shell: bottom tabs + slide-over drawer (replaces More tab). */
export default function EventShellNavigator() {
  return (
    <EventDrawerProvider>
      <MainTabNavigator />
      <AppDrawer />
    </EventDrawerProvider>
  );
}
