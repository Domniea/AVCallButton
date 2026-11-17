import { mobileTokens } from "./tokens/mobile";
import {
  nativeFontConfig,
  nativeFontFamilies,
  nativeFontWeights,
} from "./tokens/mobile/typography";

/**
 * Legacy mobile theme shape (pre-Gluestack). Kept as a plain object for
 * any residual references; runtime theming now uses theme.gluestack.ts.
 */
export const nativeTheme = {
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
};
