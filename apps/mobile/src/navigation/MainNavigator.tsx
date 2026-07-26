import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useColorModeValue } from "native-base";

import WorkspaceScreen from "../Workspace";
import EventScreen from "../Event";
import EventZonesScreen from "../EventZones";
import ZoneDetailScreen from "../ZoneDetail";
import RoomDetailScreen from "../RoomDetail";
import CrewWorkspaceScreen from "../CrewWorkspace";
import CrewEventScreen from "../CrewEvent";
import Invite from "../Invite";
import MainTabNavigator from "./MainTabNavigator";
import type { MainStackParamList } from "./types";

const Stack = createNativeStackNavigator<MainStackParamList>();

/** After login, open invite accept if a token was stored from a deep link. */
function PendingInviteRedirect() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const token = await AsyncStorage.getItem("inviteToken");
      if (!cancelled && token) {
        navigation.navigate("invite", { token });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigation]);

  return null;
}

export default function MainNavigator() {
  const headerBg = useColorModeValue("#FFFFFF", "#2A2A2A");
  const headerTint = useColorModeValue("#002624", "#F2F2F2");
  const contentBg = useColorModeValue("#F2F2F2", "#002624");

  return (
    <>
      <PendingInviteRedirect />
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: { backgroundColor: headerBg },
          headerTintColor: headerTint,
          headerTitleStyle: { fontWeight: "600", fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: contentBg },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="invite"
          component={Invite}
          options={{ title: "Invite" }}
        />
        <Stack.Screen
          name="workspace"
          component={WorkspaceScreen}
          options={{ title: "Workspace" }}
        />
        <Stack.Screen
          name="event"
          component={EventScreen}
          options={{ title: "Event" }}
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
        <Stack.Screen
          name="crewWorkspace"
          component={CrewWorkspaceScreen}
          options={{ title: "My events" }}
        />
        <Stack.Screen
          name="crewEvent"
          component={CrewEventScreen}
          options={{ title: "My event" }}
        />
      </Stack.Navigator>
    </>
  );
}
