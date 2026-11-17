import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavColors } from "../../hooks/useNavColors";

import Settings from "../screens/settings/Settings";
import DevMenu from "../screens/dev/DevMenu";
import type { SettingsStackParamList } from "./types";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

/** Settings tab stack (developer tools nested under Settings). */
export default function SettingsStackNavigator() {
  const { headerBg, headerTint, contentBg } = useNavColors();

  return (
    <Stack.Navigator
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
