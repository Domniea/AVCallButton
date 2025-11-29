// import { theme as nbTheme } from "native-base";
// import type { ITheme } from "native-base";
// import { mobileTokens } from "./tokens/mobile";

// export const nativeTheme: ITheme = {
//   ...nbTheme,
//   colors: mobileTokens.colors,
//   space: mobileTokens.spacing,
//   radii: mobileTokens.radii,
//   shadows: mobileTokens.shadows,
//   fontSizes: mobileTokens.fontSizes,
//   fonts: {
//     heading: mobileTokens.fonts.heading,
//     body: mobileTokens.fonts.body,
//     mono: mobileTokens.fonts.mono,
//   },
// };


import { theme as nbTheme } from "native-base";
import type { ITheme } from "native-base";
import { mobileTokens } from "./tokens/mobile";

export const nativeTheme: ITheme = {
  ...nbTheme,

  colors: mobileTokens.colors,
  space: mobileTokens.spacing,
  radii: mobileTokens.radii,
  fontSizes: mobileTokens.fontSizes,

  fonts: {
    heading: mobileTokens.fonts.heading,
    body: mobileTokens.fonts.body,
    mono: mobileTokens.fonts.mono,
  },
  
  shadows: {
    ...nbTheme.shadows,
    ...mobileTokens.shadows,
  },
};
