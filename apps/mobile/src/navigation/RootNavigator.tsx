import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Landing from "../Landing";
import Login from "../Login";
import SignUp from "../SignUp";
import SignupConfirm from "../SignupConfirm";
import Home from "../Home";
import Invite from "../Invite";
import Dashboard from "../Dashboard";
import WorkspaceScreen from "../Workspace";
import EventScreen from "../Event";
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
      landing: "",
      login: "login",
      home: "home",
      dashboard: "dashboard",
      workspace: "workspace/:workspaceId",
      event: "workspace/:workspaceId/event/:eventId",
      invite: "invite",
      signup: "signup",
      signupConfirm: "signup-confirm",
    },
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen
          name="landing"
          component={Landing}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="login"
          component={Login}
          options={{ title: "Log in" }}
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
        <Stack.Screen name="home" component={Home} options={{ title: "Account" }} />
        <Stack.Screen
          name="invite"
          component={Invite}
          options={{ title: "Invite" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
