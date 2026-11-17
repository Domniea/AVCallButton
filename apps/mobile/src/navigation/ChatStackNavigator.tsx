import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavColors } from "../../hooks/useNavColors";

import ChatHome from "../screens/chat/ChatHome";
import ChatThreadScreen from "../screens/chat/ChatThread";
import NewDmScreen from "../screens/chat/NewDm";
import type { ChatStackParamList } from "./types";

const Stack = createNativeStackNavigator<ChatStackParamList>();

/** Chat tab: inbox → thread / new DM. */
export default function ChatStackNavigator() {
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
        name="chatHome"
        component={ChatHome}
        options={{ title: "Chat" }}
      />
      <Stack.Screen
        name="chatThread"
        component={ChatThreadScreen}
        options={{ title: "Chat" }}
      />
      <Stack.Screen
        name="newDm"
        component={NewDmScreen}
        options={{ title: "New message" }}
      />
    </Stack.Navigator>
  );
}
