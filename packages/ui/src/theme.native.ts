import { theme as nbTheme } from "native-base";
import type { ITheme } from "native-base";
import { tokens } from "./tokens";
import { convertTokensToNativeBase } from "./convertTokens";

// Build overrides from your design tokens
const overrides = {
  colors: convertTokensToNativeBase(tokens.colors),
  radii: convertTokensToNativeBase(tokens.radii),
  space: convertTokensToNativeBase(tokens.spacing),
  fonts: {
    heading: tokens.fonts.heading.value,
    body: tokens.fonts.body.value,
    mono: tokens.fonts.mono.value,
  } as any ,
};

export const nativeTheme: ITheme = {
  ...nbTheme,
  ...overrides,
};
