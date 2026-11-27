import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavColors } from "../../hooks/useNavColors";

import EventHome from "../screens/app/EventHome";
import EventStaffScreen from "../screens/app/EventStaff";
import EventZonesScreen from "../screens/zones/EventZones";
import ZoneDetailScreen from "../screens/zones/ZoneDetail";
import RoomDetailScreen from "../screens/rooms/RoomDetail";
import type { DashStackParamList } from "./types";

const Stack = createNativeStackNavigator<DashStackParamList>();

/** Event dashboard + zones/rooms drill-down (keeps bottom tabs visible). */
export default function DashStackNavigator() {
  const { contentBg } = useNavColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: contentBg },
      }}
    >
      <Stack.Screen name="eventHome" component={EventHome} />
      <Stack.Screen name="eventZones" component={EventZonesScreen} />
      <Stack.Screen name="eventStaff" component={EventStaffScreen} />
      <Stack.Screen name="zoneDetail" component={ZoneDetailScreen} />
      <Stack.Screen name="roomDetail" component={RoomDetailScreen} />
    </Stack.Navigator>
  );
}
