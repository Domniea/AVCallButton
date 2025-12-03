// function resolveReference(ref: string, foundationColors: any) {
//   if (!ref.startsWith("{") || !ref.endsWith("}")) return ref;

//   const path = ref.replace("{", "").replace("}", "").split(".");
//   let current: any = foundationColors;

//   for (const part of path.slice(1)) {
//     if (!current[part]) return ref;
//     current = current[part];
//   }

//   // return the `.value`
//   return current.value ?? ref;
// }
// export function convertTokens(obj: any): any {
//   if (!obj) return obj;

//   if (obj.value !== undefined) return obj.value;

//   if (typeof obj === "object") {
//     const out: any = {};
//     for (const key in obj) {
//       out[key] = convertTokens(obj[key]);
//     }
//     return out;
//   }

//   return obj;
// }

// export function convertSemanticTokens(
//   semanticColors: any,
//   foundationColors: any,
// ) {
//   const out: Record<string, string> = {};

//   for (const key in semanticColors) {
//     const token = semanticColors[key]?.value;

//     if (!token) continue;

//     if (typeof token === "object" && token.base) {
//       out[key] = resolveReference(token.base, foundationColors);
//       continue;
//     }

//     if (typeof token === "string") {
//       out[key] = resolveReference(token, foundationColors);
//     }
//   }

//   return out;
// }


// --------------------------------------------------
// Resolve "{colors.primary.500}" → "#01796F"
// --------------------------------------------------
function resolveReference(ref: string, foundationColors: any) {
  if (!ref.startsWith("{") || !ref.endsWith("}")) return ref;

  const path = ref.replace("{", "").replace("}", "").split(".");
  let current: any = foundationColors;

  // skip the "colors" prefix
  for (const part of path.slice(1)) {
    if (!current[part]) return ref;
    current = current[part];
  }

  return current.value ?? ref;
}

// --------------------------------------------------
// Convert base tokens: colors, spacing, radii, etc.
// --------------------------------------------------
export function convertTokens(obj: any): any {
  if (!obj) return obj;

  if (obj.value !== undefined) return obj.value;

  if (typeof obj === "object") {
    const out: any = {};
    for (const key in obj) {
      out[key] = convertTokens(obj[key]);
    }
    return out;
  }

  return obj;
}

// --------------------------------------------------
// Convert NEW semantic token format
//
// { text: { value: { _light: "{colors.primary.900}", _dark: "{colors.tertiary.50}" } } }
//
// → {
//     text: "#002624",
//     textDark: "#F2F2F2"
//   }
// --------------------------------------------------
export function convertSemanticTokens(
  semanticSection: any,          // semanticTokens.colors or semanticTokens.shadows
  foundationColors: any          // foundation.colors
) {
  const out: Record<string, string> = {};

  for (const key in semanticSection) {
    const entry = semanticSection[key]?.value;
    if (!entry || typeof entry !== "object") continue;

    // convert light mode
    if (entry._light) {
      out[key] = resolveReference(entry._light, foundationColors);
    }

    // convert dark mode
    if (entry._dark) {
      out[`${key}Dark`] = resolveReference(entry._dark, foundationColors);
    }
  }

  return out;
}





export function convertRadiiForChakra(radii: Record<string, { value: number }>) {
  return Object.fromEntries(
    Object.entries(radii).map(([key, token]) => [
      key,
      { value: `${token.value}px` },
    ])
  );
}

export function convertShadowsForChakra(shadows: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(shadows).map(([key, value]) => [
      key,
      { value }
    ])
  );
}
