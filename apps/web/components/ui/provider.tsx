"use client"

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

import { chakraSystem } from "../../../../packages/ui";

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={chakraSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
