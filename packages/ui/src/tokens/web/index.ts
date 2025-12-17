import * as foundation from "../foundation";
import { semanticTokens } from "../semanticTokens";
import { convertRadiiForChakra } from "../../convertTokens";

import { fontSizes } from "./fontSizes";
import { breakpoints } from "./breakpoints";
import { webSpacing } from "./spacing";
import { webShadows } from "./shadows"

export const webTokens = {
  tokens: {
    colors: foundation.colors,
    spacing: foundation.spacing,
    fonts: foundation.fontFamilies,
    radii: convertRadiiForChakra(foundation.radii),
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
};

