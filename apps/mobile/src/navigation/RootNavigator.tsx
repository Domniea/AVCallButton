import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorModeValue } from "native-base";

import Login from "../Login";
import SignUp from "../SignUp";
import SignupConfirm from "../SignupConfirm";
import Home from "../Home";
import Invite from "../Invite";
import Dashboard from "../Dashboard";
import WorkspaceScreen from "../Workspace";
import EventScreen from "../Event";
import EventZonesScreen from "../EventZones";
import ZoneDetailScreen from "../ZoneDetail";
import RoomDetailScreen from "../RoomDetail";
import CrewWorkspaceScreen from "../CrewWorkspace";
import CrewEventScreen from "../CrewEvent";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: [
    "avcallbutton://",
    "https://avcallbutton.com",
    "http://localhost:3000",
  ],
  config: {
    screens: {
      login: "login",
      home: "home",
      dashboard: "dashboard",
      workspace: "workspace/:workspaceId",
      event: "workspace/:workspaceId/event/:eventId",
      eventZones: "workspace/:workspaceId/event/:eventId/zones",
      zoneDetail: "workspace/:workspaceId/event/:eventId/zone/:zoneId",
      roomDetail: "workspace/:workspaceId/event/:eventId/room/:roomId",
      crewWorkspace: "crew/workspace/:workspaceId",
      crewEvent: "crew/workspace/:workspaceId/event/:eventId",
      invite: "invite",
      signup: "signup",
      signupConfirm: "signup-confirm",
    },
  },
};

function ThemedStack() {
  const headerBg = useColorModeValue("#FFFFFF", "#2A2A2A");
  const headerTint = useColorModeValue("#002624", "#F2F2F2");
  const contentBg = useColorModeValue("#F2F2F2", "#002624");

  return (
    <Stack.Navigator
      initialRouteName="login"
      screenOptions={{
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: headerTint,
        headerTitleStyle: { fontWeight: "600", fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: contentBg },
      }}
    >
      <Stack.Screen
        name="login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="signup"
        component={SignUp}
        options={{ title: "Create Account" }}
      />
      <Stack.Screen
        name="signupConfirm"
        component={SignupConfirm}
        options={{ title: "Confirm Email" }}
      />
      <Stack.Screen
        name="dashboard"
        component={Dashboard}
        options={{ title: "Dashboard" }}
      />
      <Stack.Screen
        name="workspace"
        component={WorkspaceScreen}
        options={{ title: "Workspace" }}
      />
      <Stack.Screen
        name="event"
        component={EventScreen}
        options={{ title: "Event" }}
      />
      <Stack.Screen
        name="eventZones"
        component={EventZonesScreen}
        options={{ title: "Zones & rooms" }}
      />
      <Stack.Screen
        name="zoneDetail"
        component={ZoneDetailScreen}
        options={{ title: "Zone" }}
      />
      <Stack.Screen
        name="roomDetail"
        component={RoomDetailScreen}
        options={{ title: "Room" }}
      />
      <Stack.Screen
        name="crewWorkspace"
        component={CrewWorkspaceScreen}
        options={{ title: "My events" }}
      />
      <Stack.Screen
        name="crewEvent"
        component={CrewEventScreen}
        options={{ title: "My event" }}
      />
      <Stack.Screen name="home" component={Home} options={{ title: "Account" }} />
      <Stack.Screen
        name="invite"
        component={Invite}
        options={{ title: "Invite" }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
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
    <NavigationContainer linking={linking} theme={navTheme}>
      <ThemedStack />
    </NavigationContainer>
  );
}
