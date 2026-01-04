// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Landing from '../Landing';
import Login from '../Login';
import Home from '../Home';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
          <Stack.Screen
            name="landing"
            component={Landing}
          />
          <Stack.Screen
            name="login"
            component={Login}
          />
          <Stack.Screen
            name="home"
            component={Home}
          />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
