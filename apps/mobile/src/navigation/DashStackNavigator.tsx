import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorModeValue } from "native-base";

import EventHome from "../screens/app/EventHome";
import EventZonesScreen from "../screens/zones/EventZones";
import ZoneDetailScreen from "../screens/zones/ZoneDetail";
import RoomDetailScreen from "../screens/rooms/RoomDetail";
import type { DashStackParamList } from "./types";

const Stack = createNativeStackNavigator<DashStackParamList>();

/** Event dashboard + zones/rooms drill-down (keeps bottom tabs visible). */
export default function DashStackNavigator() {
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
        name="eventHome"
        component={EventHome}
        options={{ title: "Event Dashboard" }}
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
    </Stack.Navigator>
  );
}
