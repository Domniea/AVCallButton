import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavColors } from "../../hooks/useNavColors";

import ChatHome from "../screens/chat/ChatHome";
import ChatThreadScreen from "../screens/chat/ChatThread";
import NewDmScreen from "../screens/chat/NewDm";
import type { ChatStackParamList } from "./types";

const Stack = createNativeStackNavigator<ChatStackParamList>();

/** Chat tab: inbox → thread / new DM. */
export default function ChatStackNavigator() {
  const { contentBg } = useNavColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: contentBg },
      }}
    >
      <Stack.Screen name="chatHome" component={ChatHome} />
      <Stack.Screen name="chatThread" component={ChatThreadScreen} />
      <Stack.Screen name="newDm" component={NewDmScreen} />
    </Stack.Navigator>
  );
}
