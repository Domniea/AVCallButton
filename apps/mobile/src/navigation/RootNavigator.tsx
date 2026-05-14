import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Landing from "../Landing";
import Login from "../Login";
import SignUp from "../SignUp";
import SignupConfirm from "../SignupConfirm";
import Home from "../Home";
import Invite from "../Invite";

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [
    "avcallbutton://",
    "https://avcallbutton.com",
    "http://localhost:3000",
  ],
  config: {
    screens: {
      landing: "",
      login: "login",
      home: "home",
      invite: "invite",
      signup: "signup",
      signupConfirm: "signup-confirm",
    },
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="landing" component={Landing} />
        <Stack.Screen name="login" component={Login} />
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
        <Stack.Screen name="home" component={Home} />
        <Stack.Screen
          name="invite"
          component={Invite}
          options={{ title: "Invite" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
