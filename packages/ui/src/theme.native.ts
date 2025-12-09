import { extendTheme } from "native-base";
import { mobileTokens } from "./tokens/mobile";

export const nativeTheme = extendTheme({
  colors: mobileTokens.colors,
  space: mobileTokens.spacing,
  radii: mobileTokens.radii,
  fontSizes: mobileTokens.fontSizes,

  fonts: {
    heading: mobileTokens.fonts.heading,
    body: mobileTokens.fonts.body,
    mono: mobileTokens.fonts.mono,
  },
  shadows: mobileTokens.shadows,
});
