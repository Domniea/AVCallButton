import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { useColorModeValue } from "native-base";
import { useSelector } from "react-redux";

import type { RootState } from "@av/store";
import { LoadingScreen } from "../../components/LoadingScreen";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

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
  const isDark = useColorModeValue(false, true);
  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: "#002624",
          card: "#2A2A2A",
          text: "#F2F2F2",
          border: "#4E5D6E",
          primary: "#45FFD4",
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: "#F2F2F2",
          card: "#FFFFFF",
          text: "#002624",
          border: "#C4D2E3",
          primary: "#01796F",
        },
      };

  return (
    <NavigationContainer linking={linking as any} theme={navTheme}>
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
