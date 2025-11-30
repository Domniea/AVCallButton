// import React from "react";
// import { Box, Button, Center, Input } from "native-base";
// import { BaseInput } from "../components/BaseInput";
// import { BaseButton } from "../components/BaseButton";

// export default function Test() {
//   return (
//     <Box  p='5%' style={{flex: 1, justifyContent: 'center'}}>
//       <BaseInput label="email"/>
//       <BaseInput label="passwo"/>
//       <BaseButton title="Submit"/>
//     </Box>
//   );
// }


import React from "react";
import { Box, VStack } from "native-base";
import { BaseInput } from "../components/BaseInput";
import { BaseButton } from "../components/BaseButton";

export default function Test() {
  return (
    <Box flex={1} justifyContent="center" px="6">
      <VStack space="xl" width="100%">
        <BaseInput label="Email" placeholder="email@example.com"    shadow="card" />
        <BaseInput label="Password" placeholder="••••••••" />

        <BaseButton title="Submit" variety="primary" />
        <BaseButton title="Submit" variety="secondary" />
        <BaseButton title="Submit" variety="tertiary" />

        {/* Optional shadow test */}
        <Box
          bg="card.bg"
          shadow="card"
          borderRadius="xl"
          height="80px"
          mt="xl"
          alignItems="center"
          justifyContent="center"
        >
          Test Card Shadow
        </Box>
      </VStack>
    </Box>
  );
}
