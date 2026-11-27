import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavColors } from "../../hooks/useNavColors";

import WorkspaceSelector from "../screens/select/WorkspaceSelector";
import EventSelector from "../screens/select/EventSelector";
import CrewEventSelector from "../screens/select/CrewEventSelector";
import Settings from "../screens/settings/Settings";
import DevMenu from "../screens/dev/DevMenu";
import Invite from "../screens/auth/Invite";
import EventShellNavigator from "./EventShellNavigator";
import type { MainStackParamList } from "./types";

const Stack = createNativeStackNavigator<MainStackParamList>();

/** Post-auth stack — headerless; screens use ScreenLayout for title/back/safe area. */
export default function MainNavigator() {
  const { contentBg } = useNavColors();

  return (
    <Stack.Navigator
      initialRouteName="workspaceSelector"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: contentBg },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="workspaceSelector" component={WorkspaceSelector} />
      <Stack.Screen name="eventSelector" component={EventSelector} />
      <Stack.Screen name="crewEventSelector" component={CrewEventSelector} />
      <Stack.Screen name="settings" component={Settings} />
      <Stack.Screen name="devMenu" component={DevMenu} />
      <Stack.Screen name="invite" component={Invite} />
      <Stack.Screen
        name="MainTabs"
        component={EventShellNavigator}
        options={{ gestureEnabled: true }}
      />
    </Stack.Navigator>
  );
}
