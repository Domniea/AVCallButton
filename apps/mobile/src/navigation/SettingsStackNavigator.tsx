import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavColors } from "../../hooks/useNavColors";

import Settings from "../screens/settings/Settings";
import DevMenu from "../screens/dev/DevMenu";
import type { SettingsStackParamList } from "./types";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

/** Settings tab stack (developer tools nested under Settings). */
export default function SettingsStackNavigator() {
  const { contentBg } = useNavColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: contentBg },
      }}
    >
      <Stack.Screen name="settingsHome" component={Settings} />
      <Stack.Screen name="devMenu" component={DevMenu} />
    </Stack.Navigator>
  );
}
