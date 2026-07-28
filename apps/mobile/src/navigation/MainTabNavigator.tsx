import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useColorModeValue } from "native-base";

import ChatStackNavigator from "./ChatStackNavigator";
import DashStackNavigator from "./DashStackNavigator";
import SettingsStackNavigator from "./SettingsStackNavigator";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const tabBarBg = useColorModeValue("#FFFFFF", "#2A2A2A");
  const active = useColorModeValue("#01796F", "#45FFD4");
  const inactive = useColorModeValue("#4E5D6E", "#C4D2E3");
  const border = useColorModeValue("#C4D2E3", "#4E5D6E");

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: border,
        },
      }}
    >
      <Tab.Screen
        name="dash"
        component={DashStackNavigator}
        options={{
          title: "Event",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="chat"
        component={ChatStackNavigator}
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingsStackNavigator}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
