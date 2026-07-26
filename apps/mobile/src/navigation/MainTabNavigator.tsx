import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useColorModeValue } from "native-base";

import Dashboard from "../Dashboard";
import Home from "../Home";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const tabBarBg = useColorModeValue("#FFFFFF", "#2A2A2A");
  const headerTint = useColorModeValue("#002624", "#F2F2F2");
  const active = useColorModeValue("#01796F", "#45FFD4");
  const inactive = useColorModeValue("#4E5D6E", "#C4D2E3");
  const border = useColorModeValue("#C4D2E3", "#4E5D6E");

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: tabBarBg },
        headerTintColor: headerTint,
        headerTitleStyle: { fontWeight: "600", fontSize: 17 },
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: border,
        },
      }}
    >
      <Tab.Screen
        name="dashboard"
        component={Dashboard}
        options={{ title: "Dashboard", tabBarLabel: "Dashboard" }}
      />
      <Tab.Screen
        name="home"
        component={Home}
        options={{ title: "Account", tabBarLabel: "Account" }}
      />
    </Tab.Navigator>
  );
}
