import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorModeValue } from "native-base";

import Login from "../Login";
import SignUp from "../SignUp";
import SignupConfirm from "../SignupConfirm";
import Invite from "../Invite";
import type { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const headerBg = useColorModeValue("#FFFFFF", "#2A2A2A");
  const headerTint = useColorModeValue("#002624", "#F2F2F2");
  const contentBg = useColorModeValue("#F2F2F2", "#002624");

  return (
    <Stack.Navigator
      initialRouteName="login"
      screenOptions={{
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: headerTint,
        headerTitleStyle: { fontWeight: "600", fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: contentBg },
      }}
    >
      <Stack.Screen
        name="login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="signup"
        component={SignUp}
        options={{ title: "Create Account" }}
      />
      <Stack.Screen
        name="signupConfirm"
        component={SignupConfirm}
        options={{ title: "Confirm Email" }}
      />
      <Stack.Screen
        name="invite"
        component={Invite}
        options={{ title: "Invite" }}
      />
    </Stack.Navigator>
  );
}
