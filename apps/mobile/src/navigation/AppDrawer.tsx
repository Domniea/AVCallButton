import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import type { RootState } from "@av/store";

import { useViewMode } from "../hooks/useViewMode";
import { getLastSession, type LastSession } from "../lib/lastSession";
import { canAccessAdminDash, resolveViewMode } from "../lib/viewMode";
import { useEventDrawer } from "./EventDrawerContext";
import type { MainStackParamList } from "./types";

const DRAWER_WIDTH = Math.min(300, Dimensions.get("window").width * 0.82);
const NAVY = "#101828";
const NAVY_MUTED = "#667085";
const NAVY_ACTIVE_BG = "rgba(59, 130, 246, 0.18)";
const ACCENT = "#3B82F6";

type DrawerNav = NativeStackNavigationProp<MainStackParamList>;

type DrawerItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  leadOnly?: boolean;
};

export function AppDrawer() {
  const { isOpen, closeDrawer } = useEventDrawer();
  const navigation = useNavigation<DrawerNav>();
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const [visible, setVisible] = useState(false);
  const [session, setSession] = useState<LastSession | null>(null);

  const { viewMode } = useViewMode();
  const workspaces = useSelector(
    (state: RootState) => state.workspace.workspaces,
  );
  const events = useSelector((state: RootState) => state.events.events);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!isOpen) return;
    void getLastSession().then(setSession).catch(() => setSession(null));
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.timing(slide, {
      toValue: -DRAWER_WIDTH,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  }, [isOpen, slide]);

  const workspace = workspaces.find(
    (w) => w.workspaceId === session?.workspaceId,
  );
  const event = events.find((e) => e.id === session?.eventId);
  const roleRank = workspace?.roleRank ?? 0;
  const mode = resolveViewMode(roleRank, viewMode);
  const isLead = mode === "admin" && canAccessAdminDash(roleRank);

  const runAndClose = useCallback(
    (action: () => void) => {
      closeDrawer();
      requestAnimationFrame(action);
    },
    [closeDrawer],
  );

  const goTab = useCallback(
    (
      tab: "dash" | "alerts" | "chat",
      dashScreen?: "eventHome" | "eventZones" | "eventStaff",
    ) => {
      runAndClose(() => {
        if (tab === "alerts") {
          navigation.navigate("MainTabs", {
            screen: "alerts",
            params: { screen: "alertsHome" },
          });
          return;
        }
        if (tab === "chat") {
          navigation.navigate("MainTabs", {
            screen: "chat",
            params: { screen: "chatHome" },
          });
          return;
        }
        if (!dashScreen || !session) {
          navigation.navigate("MainTabs");
          return;
        }
        navigation.navigate("MainTabs", {
          screen: "dash",
          params: {
            screen: dashScreen,
            params: {
              workspaceId: session.workspaceId,
              eventId: session.eventId,
            },
          },
        });
      });
    },
    [navigation, runAndClose, session],
  );

  const items = useMemo((): DrawerItem[] => {
    const rows: DrawerItem[] = [
      {
        key: "overview",
        label: "Overview",
        icon: "grid-outline",
        onPress: () => goTab("dash", "eventHome"),
      },
      {
        key: "alerts",
        label: "Alerts",
        icon: "notifications-outline",
        onPress: () => goTab("alerts"),
      },
      {
        key: "chat",
        label: "Chat",
        icon: "chatbubble-outline",
        onPress: () => goTab("chat"),
      },
      {
        key: "zones",
        label: "Zones & rooms",
        icon: "map-outline",
        leadOnly: true,
        onPress: () => goTab("dash", "eventZones"),
      },
      {
        key: "staff",
        label: "Staff",
        icon: "people-outline",
        leadOnly: true,
        onPress: () => goTab("dash", "eventStaff"),
      },
      {
        key: "settings",
        label: "Settings",
        icon: "settings-outline",
        onPress: () => runAndClose(() => navigation.navigate("settings")),
      },
    ];
    return rows.filter((row) => !row.leadOnly || isLead);
  }, [goTab, isLead, navigation, runAndClose]);

  if (!visible) return null;

  const displayName = user?.email ?? user?.id ?? "Account";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={closeDrawer} />
        <Animated.View
          style={[
            styles.panel,
            {
              width: DRAWER_WIDTH,
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateX: slide }],
            },
          ]}
        >
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>AV Call</Text>
            <Text style={styles.brandSub} numberOfLines={1}>
              {event?.name ?? "No event selected"}
            </Text>
            {workspace?.name ? (
              <Text style={styles.brandMeta} numberOfLines={1}>
                {workspace.name}
              </Text>
            ) : null}
          </View>

          <View style={styles.eventInfo}>
            <Text style={styles.sectionLabel}>Event</Text>
            <Text style={styles.infoLine}>
              Status: {event?.status ?? "—"}
            </Text>
            {event?.location ? (
              <Text style={styles.infoLine}>Location: {event.location}</Text>
            ) : null}
            {event?.venue ? (
              <Text style={styles.infoLine}>Venue: {event.venue}</Text>
            ) : null}
            <Text style={styles.infoLine} numberOfLines={1}>
              Signed in: {displayName}
            </Text>
          </View>

          <View style={styles.nav}>
            {items.map((item) => (
              <Pressable
                key={item.key}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.navItem,
                  pressed && styles.navItemPressed,
                ]}
              >
                <Ionicons name={item.icon} size={20} color="#E4E7EC" />
                <Text style={styles.navLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.footer}>
            <Pressable
              onPress={() =>
                runAndClose(() => {
                  if (!session) {
                    navigation.navigate("workspaceSelector");
                    return;
                  }
                  if (isLead) {
                    navigation.navigate("eventSelector", {
                      workspaceId: session.workspaceId,
                    });
                  } else {
                    navigation.navigate("crewEventSelector", {
                      workspaceId: session.workspaceId,
                    });
                  }
                })
              }
              style={({ pressed }) => [
                styles.navItem,
                pressed && styles.navItemPressed,
              ]}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={20}
                color={ACCENT}
              />
              <Text style={[styles.navLabel, { color: ACCENT }]}>
                Switch event
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  panel: {
    height: "100%",
    backgroundColor: NAVY,
    paddingHorizontal: 16,
    zIndex: 2,
  },
  brandBlock: {
    marginBottom: 20,
    paddingHorizontal: 8,
    gap: 4,
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  brandSub: {
    color: "#F8F9FB",
    fontSize: 14,
    fontWeight: "600",
  },
  brandMeta: {
    color: NAVY_MUTED,
    fontSize: 12,
  },
  eventInfo: {
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    gap: 4,
  },
  sectionLabel: {
    color: NAVY_MUTED,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  infoLine: {
    color: "#D0D5DD",
    fontSize: 12,
  },
  nav: {
    flex: 1,
    gap: 4,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  navItemPressed: {
    backgroundColor: NAVY_ACTIVE_BG,
  },
  navLabel: {
    color: "#E4E7EC",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.12)",
    paddingTop: 12,
  },
});
