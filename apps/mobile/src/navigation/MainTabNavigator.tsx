import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";

import type { RootState } from "@av/store";

import { useNavColors } from "../../hooks/useNavColors";
import { useAlertBadgeCount } from "../lib/alerts/useAlertBadgeCount";
import { useChatUnreadTotal } from "../lib/chat/useChatUnreadTotal";
import AlertsStackNavigator from "./AlertsStackNavigator";
import ChatStackNavigator from "./ChatStackNavigator";
import DashStackNavigator from "./DashStackNavigator";
import SettingsStackNavigator from "./SettingsStackNavigator";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { tabBarBg, tabActive, tabInactive, tabBorder } = useNavColors();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const authenticated = authStatus === "authenticated";
  const unreadTotal = useChatUnreadTotal(authenticated);
  const activeAlerts = useAlertBadgeCount(authenticated);
  const chatBadge =
    unreadTotal > 0 ? (unreadTotal > 99 ? "99+" : unreadTotal) : undefined;
  // Omit badge when 0 — bottom-tabs types are number | string only (not null).
  const alertsBadge =
    activeAlerts > 0 ? (activeAlerts > 99 ? "99+" : activeAlerts) : undefined;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tabActive,
        tabBarInactiveTintColor: tabInactive,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: tabBorder,
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
        name="alerts"
        component={AlertsStackNavigator}
        options={{
          title: "Alerts",
          tabBarBadge: alertsBadge,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="warning-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="chat"
        component={ChatStackNavigator}
        options={{
          title: "Chat",
          tabBarBadge: chatBadge,
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
