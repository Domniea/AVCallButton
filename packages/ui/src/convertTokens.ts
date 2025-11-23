export const convertTokensToNativeBase = (obj: any): any => {
  if (obj == null) return obj;
  
  if (typeof obj === "object" && "value" in obj) {
    return obj.value;
  }

  if (typeof obj === "object" && !Array.isArray(obj)) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [key, convertTokensToNativeBase(val)])
    );
  }

  return obj;
};
