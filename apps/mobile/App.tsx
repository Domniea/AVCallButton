import { NativeBaseProvider } from "native-base";
import { test } from "@av/ui";
import React from "react";
import { StyleSheet, View } from "react-native";
import Test from "./src/Test";

export default function App() {
  console.log(test)
  return (
      <View style={styles.container}>
        <Test />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

