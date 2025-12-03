import { NativeBaseProvider } from "native-base";
import { nativeTheme } from "@av/ui";
import React from "react";
import { StyleSheet, View } from "react-native";
import Test from "./src/Test";

export default function App() {
  console.log(nativeTheme)
  return (
    <NativeBaseProvider theme={nativeTheme}>
      <Test />
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});