import { NativeBaseProvider } from "native-base";
import { nativeTheme } from "@av/ui";
import React from "react";
import { StyleSheet, View } from "react-native";
import Test from "./src/Test";

export default function App() {
  return (
    <NativeBaseProvider theme={nativeTheme}>
      {/* <View style={styles.container}> */}
        <Test />
      {/* </View> */}
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// import { Box, Text, Button, useTheme } from 'native-base';

// export default function TestNativeBaseScreen() {
//   const theme = useTheme();

//   return (
//     <Box flex={1} bg="primary.500" alignItems="center" justifyContent="center">
//       <Text color="white" fontSize="xl">
//         NativeBase Test
//       </Text>

//       <Button mt={4}>Press me</Button>

//       <Text mt={4}>{`Theme loaded: ${Object.keys(theme.colors).length} colors`}</Text>
//     </Box>
//   );
// }
