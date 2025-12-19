import { NativeBaseProvider } from "native-base";
import { nativeTheme } from "@av/ui";
import { ReduxProvider } from "@av/store";
import React from "react";
import { StyleSheet, View } from "react-native";
import Test from "./src/Test";

export default function App() {
  return (
    <NativeBaseProvider theme={nativeTheme}>
      <ReduxProvider>
        <Test />
      </ReduxProvider>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
