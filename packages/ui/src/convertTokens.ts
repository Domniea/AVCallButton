// export function convertTokens(obj: any) {
//   if (!obj) return obj;

//   if (obj.value !== undefined && typeof obj.value !== "object") {
//     return obj.value;
//   }

//   if (typeof obj === "object") {
//     const output: any = {};
//     for (const key in obj) {
//       output[key] = convertTokens(obj[key]);
//     }
//     return output;
//   }

//   return obj;
// }

// // Pass foundationColors when calling convertSemanticTokens()
// export function convertSemanticTokens(obj: any, foundationColors: any = {}): any {
//   const out: Record<string, string> = {};

//   for (const key in obj) {
//     const entry = obj[key];

//     // Must contain "value"
//     if (!entry || !entry.value) continue;

//     let base = entry.value.base ?? entry.value.default ?? entry.value;

//     // Case: still nested object
//     if (typeof base === "object") {
//       base = base.base ?? null;
//     }

//     if (typeof base !== "string") continue;

//     // Replace references like `{colors.primary.500}`
//     if (base.startsWith("{") && base.endsWith("}")) {
//       const path = base
//         .replace("{", "")
//         .replace("}", "")
//         .split(".");

//       let resolved: any = foundationColors;

//       for (const p of path) {
//         if (resolved[p]) {
//           resolved = resolved[p];
//         }
//       }

//       if (resolved?.value) {
//         base = resolved.value;
//       }
//     }

//     out[key] = base;
//   }

//   return out;
// }

// -------------------------------------------------------------
// 1. Resolve {colors.primary.500} references
// -------------------------------------------------------------
function resolveReference(ref: string, foundationColors: any) {
  if (!ref.startsWith("{") || !ref.endsWith("}")) return ref;

  const path = ref.replace("{", "").replace("}", "").split(".");
  let current: any = foundationColors;

  for (const part of path.slice(1)) {
    if (!current[part]) return ref;
    current = current[part];
  }

  // return the `.value`
  return current.value ?? ref;
}

// -------------------------------------------------------------
// 2. Convert foundation tokens (keep `.value`)
// -------------------------------------------------------------
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

export function convertSemanticTokens(
  semanticColors: any,
  foundationColors: any,
) {
  const out: Record<string, string> = {};

  for (const key in semanticColors) {
    const token = semanticColors[key]?.value;

    if (!token) continue;

    if (typeof token === "object" && token.base) {
      out[key] = resolveReference(token.base, foundationColors);
      continue;
    }

    if (typeof token === "string") {
      out[key] = resolveReference(token, foundationColors);
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
