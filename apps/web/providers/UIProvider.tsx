"use client";

import { ChakraProvider } from "@chakra-ui/react";
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "../components/ui/color-mode";

import { system as chakraSystem } from "../../../packages/ui/src/theme.chakra";

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={chakraSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
