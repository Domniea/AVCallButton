import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorModeValue } from "native-base";

import WorkspaceSelector from "../screens/select/WorkspaceSelector";
import EventSelector from "../screens/select/EventSelector";
import CrewEventSelector from "../screens/select/CrewEventSelector";
import Settings from "../screens/settings/Settings";
import DevMenu from "../screens/dev/DevMenu";
import Invite from "../screens/auth/Invite";
import MainTabNavigator from "./MainTabNavigator";
import type { MainStackParamList } from "./types";

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  const headerBg = useColorModeValue("#FFFFFF", "#2A2A2A");
  const headerTint = useColorModeValue("#002624", "#F2F2F2");
  const contentBg = useColorModeValue("#F2F2F2", "#002624");

  return (
    <Stack.Navigator
      initialRouteName="workspaceSelector"
      screenOptions={{
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: headerTint,
        headerTitleStyle: { fontWeight: "600", fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: contentBg },
      }}
    >
      <Stack.Screen
        name="workspaceSelector"
        component={WorkspaceSelector}
        options={{ title: "Select a Workspace" }}
      />
      <Stack.Screen
        name="eventSelector"
        component={EventSelector}
        options={{ title: "Select an Event" }}
      />
      <Stack.Screen
        name="crewEventSelector"
        component={CrewEventSelector}
        options={{ title: "Select an Event" }}
      />
      <Stack.Screen
        name="settings"
        component={Settings}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="devMenu"
        component={DevMenu}
        options={{ title: "Developer" }}
      />
      <Stack.Screen
        name="invite"
        component={Invite}
        options={{ title: "Invite" }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
