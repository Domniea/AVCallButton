import * as foundation from "../foundation";
import { semanticTokens } from "../semanticTokens";
import { convertRadiiForChakra } from "../../convertTokens";

import { fontSizes } from "./fontSizes";
import { breakpoints } from "./breakpoints";
import { webSpacing } from "./spacing";
import { webShadows } from "./shadows";

export const webTokens = {
  tokens: {
    colors: foundation.colors,
    spacing: foundation.spacing,
    fonts: foundation.fonts,
    radii: convertRadiiForChakra(foundation.radii),
  //   shadows: {
  //       outline: { value: "0 4px 14px rgba(87,115,255,0.45)" },
  //   },
  //         card: {
  //   value: {
  //     _light: "0 4px 12px rgba(0,0,0,0.14)",
  //     _dark: "0 4px 12px rgba(0,0,0,0.40)",
  //   },
  // }
    shadows: {
      card: {
    value: {
      _light: "0 4px 12px rgba(0,0,0,0.14)",
      _dark: "0 4px 12px rgba(0,0,0,0.40)",
    },
  },
    }
  },

  semanticTokens,

  breakpoints: Object.fromEntries(
    Object.entries(breakpoints).map(([k, v]) => [k, v.value])
  ),

  space: Object.fromEntries(
    Object.entries(webSpacing).map(([k, v]) => [k, v])
  ),

  fontSizes: Object.fromEntries(
    Object.entries(fontSizes).map(([k, v]) => [k, v.value])
  ),

    // shadows: webShadows, 
};

