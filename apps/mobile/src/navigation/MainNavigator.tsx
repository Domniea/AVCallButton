import { useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useColorModeValue } from "native-base";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "@av/store";
import { setActiveWorkspace } from "@av/store";

import WorkspaceSelector from "../screens/select/WorkspaceSelector";
import EventSelector from "../screens/select/EventSelector";
import EventZonesScreen from "../screens/zones/EventZones";
import ZoneDetailScreen from "../screens/zones/ZoneDetail";
import RoomDetailScreen from "../screens/rooms/RoomDetail";
import CrewEventSelector from "../screens/select/CrewEventSelector";
import Settings from "../screens/settings/Settings";
import DevMenu from "../screens/dev/DevMenu";
import Invite from "../screens/auth/Invite";
import { getLastSession } from "../lib/lastSession";
import MainTabNavigator from "./MainTabNavigator";
import { navigateToEventHome } from "./navigateToWorkspaceSelector";
import type { MainStackParamList } from "./types";

const Stack = createNativeStackNavigator<MainStackParamList>();

/**
 * After login: prefer pending invite, else restore last workspace/event session.
 */
function SessionBootstrapRedirect() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    void (async () => {
      const inviteToken = await AsyncStorage.getItem("inviteToken");
      if (inviteToken) {
        navigation.navigate("invite", { token: inviteToken });
        return;
      }

      const session = await getLastSession();
      if (!session) return;

      dispatch(setActiveWorkspace(session.workspaceId));
      navigateToEventHome(navigation, session.workspaceId, session.eventId);
    })();
  }, [navigation, dispatch]);

  return null;
}

export default function MainNavigator() {
  const headerBg = useColorModeValue("#FFFFFF", "#2A2A2A");
  const headerTint = useColorModeValue("#002624", "#F2F2F2");
  const contentBg = useColorModeValue("#F2F2F2", "#002624");

  return (
    <>
      <SessionBootstrapRedirect />
      <Stack.Navigator
        initialRouteName="workspaceSelector"
        screenOptions={{
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
    </>
  );
}
