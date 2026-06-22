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
  fontSizes: mobileTokens.fontSizes,
  fontConfig: nativeFontConfig,

  fontWeights: nativeFontWeights,

  fonts: {
    heading: nativeFontFamilies.heading,
    body: nativeFontFamilies.body,
    mono: nativeFontFamilies.mono,
  },
});
