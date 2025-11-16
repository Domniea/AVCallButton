/**
 * Root App Component
 */

import { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Text } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import Config from "react-native-config";

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  useEffect(() => {
    console.log("APP_ENV:", Config.APP_ENV);
    console.log("FIREBASE_ENV:", Config.FIREBASE_ENV);
    console.log("DEV PROJECT:", Config.FIREBASE_PROJECT_ID_DEV);
    console.log("PROD PROJECT:", Config.FIREBASE_PROJECT_ID_PROD);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <Text style={styles.text}>AV Call Button — Bare RN App Running</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
  },
});

export default App;
