// import { extendTheme } from "native-base";
// import { mobileTokens } from "./tokens/mobile";

// export const nativeTheme = extendTheme({
//   components: {
//     Input: {
//       defaultProps: {
//         _stack: {style: {},
//       }},
//     },
//   },
//   colors: mobileTokens.colors,
//   space: mobileTokens.spacing,
//   radii: mobileTokens.radii,
//   fontConfig: {
//     "sans-serif": {
//       400: { normal: "sans-serif" },
//       500: { normal: "sans-serif-medium" },
//       600: { normal: "sans-serif-medium" },
//       700: { normal: "sans-serif-medium" },
//     },
//     monospace: {
//       400: { normal: "monospace" },
//     },
//   },
//   fontWeights: {
//     normal: "400",
//     medium: "500",
//     semibold: "600",
//     bold: "700",
//   },

//   fonts: {
//     heading: mobileTokens.fonts.heading,
//     body: mobileTokens.fonts.body,
//     mono: mobileTokens.fonts.mono,
//   },
//   shadows: mobileTokens.shadows,
// });



import { extendTheme } from "native-base";

import { mobileTokens } from "./tokens/mobile";
import {
  nativeFontConfig,
  nativeFontFamilies,
  nativeFontWeights,
} from "./tokens/mobile/typography";

export const nativeTheme = extendTheme({
  components: {
    Input: {
      defaultProps: {
        _stack: {
          style: {},
        },
      },
    },
  },
  colors: mobileTokens.colors,
  space: mobileTokens.spacing,
  radii: mobileTokens.radii,
  shadows: mobileTokens.shadows,
  fontConfig: nativeFontConfig,

  fontWeights: nativeFontWeights,

  fonts: {
    heading: nativeFontFamilies.heading,
    body: nativeFontFamilies.body,
    mono: nativeFontFamilies.mono,
  },
});
