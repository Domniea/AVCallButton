import { tokens } from "./tokens";
import { convertTokensToNativeBase } from "./convertTokens";

export const test = 'boobs'

export const nativeTheme = {
  colors: convertTokensToNativeBase(tokens.colors),
  radii: convertTokensToNativeBase(tokens.radii),
  space: convertTokensToNativeBase(tokens.spacing,),
  fonts: {
    heading: convertTokensToNativeBase(tokens.fonts.heading),
    body: convertTokensToNativeBase(tokens.fonts.body),
  },
};