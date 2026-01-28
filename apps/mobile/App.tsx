import 'react-native-gesture-handler'; 
import "react-native-get-random-values";

import React from "react";
import { StyleSheet } from "react-native";
import { ClientProviders } from "./providers/ClientProvidersWrapper";
import RootNavigator from "./src/navigation/RootNavigator";


export default function App() {
  return (
    <ClientProviders>
      <RootNavigator />
    </ClientProviders>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
