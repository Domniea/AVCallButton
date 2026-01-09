import * as foundation from "../foundation";
import { semanticTokens } from "../semanticTokens";
import { convertTokens, convertSemanticTokens } from "../../convertTokens";

import { fontSizes } from "./fontSizes";
import { shadows } from "./shadows";
import { mobileSpacing } from "./spacing";
import { radii } from "../foundation/radii";

import {
  nativeFontConfig,
  nativeFontFamilies,
  nativeFontWeights,
} from "./typography";

export const mobileTokens = {
  colors: {
    ...convertTokens(foundation.colors),
    ...convertSemanticTokens(semanticTokens.colors, foundation.colors),
  },

  spacing: convertTokens(mobileSpacing),
  radii: convertTokens(radii),
  fontConfig: nativeFontConfig,
  fonts: nativeFontFamilies,
  fontWeights: nativeFontWeights,
  fontSizes,
  shadows,
};
