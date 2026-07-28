import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorModeValue } from "native-base";

import Settings from "../screens/settings/Settings";
import DevMenu from "../screens/dev/DevMenu";
import type { SettingsStackParamList } from "./types";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

/** Settings tab stack (developer tools nested under Settings). */
export default function SettingsStackNavigator() {
  const headerBg = useColorModeValue("#FFFFFF", "#2A2A2A");
  const headerTint = useColorModeValue("#002624", "#F2F2F2");
  const contentBg = useColorModeValue("#F2F2F2", "#002624");

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: headerTint,
        headerTitleStyle: { fontWeight: "600", fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: contentBg },
      }}
    >
      <Stack.Screen
        name="settingsHome"
        component={Settings}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="devMenu"
        component={DevMenu}
        options={{ title: "Developer" }}
      />
    </Stack.Navigator>
  );
}
