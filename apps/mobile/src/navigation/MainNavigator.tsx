import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavColors } from "../../hooks/useNavColors";

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
  const { headerBg, headerTint, contentBg } = useNavColors();

  return (
    <Stack.Navigator
      initialRouteName="workspaceSelector"
      screenOptions={{
        headerTransparent: false,
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
