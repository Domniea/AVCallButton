import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavColors } from "../../hooks/useNavColors";

import AlertsHome from "../screens/alerts/AlertsHome";
import RoomDetailScreen from "../screens/rooms/RoomDetail";
import type { AlertsStackParamList } from "./types";

const Stack = createNativeStackNavigator<AlertsStackParamList>();

/** Alerts tab: board → room detail (tabs stay visible). */
export default function AlertsStackNavigator() {
  const { contentBg } = useNavColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: contentBg },
      }}
    >
      <Stack.Screen name="alertsHome" component={AlertsHome} />
      <Stack.Screen name="roomDetail" component={RoomDetailScreen} />
    </Stack.Navigator>
  );
}
