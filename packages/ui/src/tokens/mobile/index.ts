import * as foundation from "../foundation";
import { semanticTokens } from "../semanticTokens";
import { convertTokens, convertSemanticTokens } from "../../convertTokens";

import { fontSizes } from "./fontSizes";
import { shadows } from "./shadows";
import { mobileSpacing } from "./spacing";
import { radii } from "../foundation/radii";
import { fonts } from "../foundation/fonts";

export const mobileTokens = {
  colors: {
    ...convertTokens(foundation.colors),
    ...convertSemanticTokens(semanticTokens.colors, foundation.colors),
  },

  spacing: convertTokens(mobileSpacing),
  radii: convertTokens(radii),
  fonts: convertTokens(fonts),
  fontSizes,
  shadows,
};
