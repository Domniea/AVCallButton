import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavColors } from "../../hooks/useNavColors";

import AlertsHome from "../screens/alerts/AlertsHome";
import RoomDetailScreen from "../screens/rooms/RoomDetail";
import type { AlertsStackParamList } from "./types";

const Stack = createNativeStackNavigator<AlertsStackParamList>();

/** Alerts tab: board → room detail (tabs stay visible). */
export default function AlertsStackNavigator() {
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
        name="alertsHome"
        component={AlertsHome}
        options={{ title: "Alerts" }}
      />
      <Stack.Screen
        name="roomDetail"
        component={RoomDetailScreen}
        options={{ title: "Room" }}
      />
    </Stack.Navigator>
  );
}
