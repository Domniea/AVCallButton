// "use client";

// import React from "react";
// import { Box, VStack } from "@chakra-ui/react";
// import { BaseInput } from "../components/reusable/BaseInput";
// import { BaseButton } from "../components/reusable/BaseButton";

// export default function Test() {
//   return (
//     <Box  flex='1' h='100vh' display="flex" justifyContent="center" alignItems={'space-evenly'} px="6" py="6" bg={'bg'}>
//       <VStack shadow='cardShadow' p='' gap="xl" w="xl" h="100%" justifyContent={'space-evenly'}>
//         <BaseInput
//           label="Email"
//           placeholder="email@example.com"
//           shadow='card'
//         />

//         <BaseInput
//           label="Password"
//           placeholder="••••••••"
//         />

//         {/* Buttons */}
//         <BaseButton title="Submit" variety="primary" />
//         <BaseButton title="Submit" variety="secondary" />
//         <BaseButton title="Submit" variety="tertiary" />

//         {/* Optional shadow demo */}
//         <Box
//           bg="card.bg"
//           shadow="card"
//           borderRadius="xl"
//           p='6'
//           mt="xl"
//           display="flex"
//           alignItems="center"
//           justifyContent="center"
//           color={'text'}
//         >
//           Test Card Shadow
//         </Box>
//       </VStack>
//     </Box>
//   );
// }

"use client";

import React from "react";
import { Box, VStack } from "@chakra-ui/react";
import { BaseInput } from "../components/reusable/BaseInput";
import { BaseButton } from "../components/reusable/BaseButton";

export default function Test() {
  return (
    <Box
      flex="1"
      h="100vh"
      bg="bg"
      display="flex"
      justifyContent="center"
      px="6"
      py="6"
    >
      <VStack
        shadow="card"
        bg="surface"
        borderRadius="xl"
        p="8"
        gap="xl"
        w="100%"
        maxW="xl"
        h="100%"
        justifyContent="space-evenly"
      >
        <BaseInput
          label="Email"
          placeholder="email@example.com"
          shadow="card"
        />

        <BaseInput
          label="Password"
          placeholder="••••••••"
        />

        {/* Buttons */}
        <BaseButton title="Submit" variety="primary" />
        <BaseButton title="Submit" variety="secondary" />
        <BaseButton title="Submit" variety="tertiary" />

        {/* Optional shadow demo */}
        <Box
          bg="cardBg"
          shadow="card"
          borderRadius="xl"
          p="6"
          w="100%"
          textAlign="center"
          color="text"
        >
          Test Card Shadow
        </Box>
      </VStack>
    </Box>
  );
}
