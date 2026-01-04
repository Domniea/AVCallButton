import "react-native-get-random-values";

import React from "react";
import { StyleSheet, View } from "react-native";
import Test from "./src/Login";
import { ClientProviders } from "./providers/ClientProviders";
import RootNavigator from "./src/navigation/RootNavigator";
import { Root } from "@chakra-ui/react/dist/types/components/accordion/namespace";

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
