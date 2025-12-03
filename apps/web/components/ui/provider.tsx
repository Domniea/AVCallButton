// "use client"

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

// monorepo shared system (your custom theme)
import { chakraSystem } from "../../../../packages/ui";

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={chakraSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}