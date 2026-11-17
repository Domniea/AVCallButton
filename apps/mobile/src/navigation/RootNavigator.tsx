import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { useSelector } from "react-redux";

import type { RootState } from "@av/store";
import { LoadingScreen } from "../../components/LoadingScreen";
import { useColorMode } from "../../providers/ColorModeProvider";
import { useNavColors } from "../../hooks/useNavColors";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { navigationRef } from "./navigationRef";

// Auth and Main trees swap via ternary; linking covers both route maps.
const linking = {
  prefixes: [
    "avcallbutton://",
    "https://avcallbutton.com",
    "http://localhost:3000",
  ],
  config: {
    screens: {
      login: "login",
      signup: "signup",
      signupConfirm: "signup-confirm",
      invite: "invite",
      workspaceSelector: "workspaces",
      settings: "settings",
      devMenu: "dev",
      eventSelector: "workspace/:workspaceId",
      crewEventSelector: "crew/workspace/:workspaceId",
      MainTabs: {
        screens: {
          dash: {
            screens: {
              eventHome: "workspace/:workspaceId/event/:eventId",
              eventZones: "workspace/:workspaceId/event/:eventId/zones",
              zoneDetail: "workspace/:workspaceId/event/:eventId/zone/:zoneId",
              roomDetail: "workspace/:workspaceId/event/:eventId/room/:roomId",
            },
          },
          chat: {
            screens: {
              chatHome: "event/chat",
              chatThread: "event/chat/thread/:threadId",
              newDm: "event/chat/new",
            },
          },
          settings: {
            screens: {
              settingsHome: "event/settings",
              devMenu: "event/dev",
            },
          },
        },
      },
    },
  },
} as const;

export default function RootNavigator() {
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const { colorMode } = useColorMode();
  const { navThemeColors } = useNavColors();
  const isDark = colorMode === "dark";
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      ...navThemeColors,
    },
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking as any}
      theme={navTheme}
    >
      {authStatus === "idle" || authStatus === "loading" ? (
        <LoadingScreen message="Checking session…" />
      ) : authStatus === "authenticated" ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
