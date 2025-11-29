import React from "react";
import { Box, Button, Center, Input } from "native-base";
import { BaseInput } from "../components/BaseInput";
import { BaseButton } from "../components/BaseButton";

export default function Test() {
  return (
    <Box  p='5%' style={{flex: 1, justifyContent: 'center'}}>
      {/* <Button >Hello from UI</Button> */}
      <BaseInput label="email"/>
      <BaseInput label="passwo"/>
      <BaseButton title="Submit"/>
    </Box>
  );
}
