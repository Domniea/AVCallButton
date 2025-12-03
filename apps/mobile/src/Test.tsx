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


// import React from "react";
// import { Box, VStack } from "native-base";
// import { BaseInput } from "../components/BaseInput";
// import { BaseButton } from "../components/BaseButton";

// export default function Test() {
//   return (
//     <Box flex={1} justifyContent="center" px="6">
//       <VStack space="xl" width="100%">
//         <BaseInput label="Email" placeholder="email@example.com"    shadow="card" />
//         <BaseInput label="Password" placeholder="••••••••" />

//         <BaseButton title="Submit" variety="primary" />
//         <BaseButton title="Submit" variety="secondary" />
//         <BaseButton title="Submit" variety="tertiary" />

//         {/* Optional shadow test */}
//         <Box
//           bg="card.bg"
//           shadow="card"
//           borderRadius="xl"
//           height="80px"
//           mt="xl"
//           alignItems="center"
//           justifyContent="center"
//         >
//           Test Card Shadow
//         </Box>
//       </VStack>
//     </Box>
//   );
// }


// apps/mobile/app/TestScreen.tsx
import React from "react";
import {
  Box,
  VStack,
  Switch,
  HStack,
  Text,
  useColorMode,
  useColorModeValue,
} from "native-base";

import { BaseInput } from "../components/BaseInput";
import { BaseButton } from "../components/BaseButton";

export default function TestScreen() {
  const { colorMode, toggleColorMode } = useColorMode();

  const bg = useColorModeValue("bg", "bgDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const cardBg = useColorModeValue("cardBg", "cardBgDark");
  const textColor = useColorModeValue("text", "textDark");

  return (
    <Box
      flex={1}
      bg={bg}
      px="6"
      py="6"
      justifyContent="center"
    >
      {/* ==== Theme Switch ==== */}
      <HStack
        position="absolute"
        top={10}
        right={10}
        alignItems="center"
        space={3}
      >
        <Text fontSize="lg" color={textColor}>
          {colorMode === "light" ? "Light" : "Dark"}
        </Text>

        <Switch
          isChecked={colorMode === "dark"}
          onToggle={toggleColorMode}
        />
      </HStack>

      {/* ==== Card Container ==== */}
      <VStack
        shadow="card"
        bg={surface}
        borderRadius="xl"
        p="8"
        space="xl"
        w="100%"
        maxW="xl"
        height="100%"
        justifyContent="space-evenly"
        alignSelf="center"
      >
        {/* INPUTS */}
        <BaseInput
          label="Email"
          placeholder="email@example.com"
          shadow="card"
        />

        <BaseInput
          label="Password"
          placeholder="••••••••"
        />

        {/* BUTTONS */}
        <BaseButton title="Submit" variety="primary" />
        <BaseButton title="Submit" variety="secondary" />
        <BaseButton title="Submit" variety="tertiary" />

        {/* ==== Shadow Demo Card ==== */}
        <Box
          bg={cardBg}
          shadow="card"
          borderRadius="xl"
          p="6"
          w="100%"
          alignItems="center"
        >
          <Text color={textColor}>Test Card Shadow</Text>
        </Box>
      </VStack>
    </Box>
  );
}
