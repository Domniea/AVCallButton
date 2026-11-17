import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavColors } from "../../hooks/useNavColors";

import Login from "../screens/auth/Login";
import SignUp from "../screens/auth/SignUp";
import SignupConfirm from "../screens/auth/SignupConfirm";
import Invite from "../screens/auth/Invite";
import type { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const { headerBg, headerTint, contentBg } = useNavColors();

  return (
    <Stack.Navigator
      initialRouteName="login"
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
