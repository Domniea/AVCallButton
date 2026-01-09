import { PropsWithChildren } from "react";
import { NativeBaseProvider } from "native-base";
// import { nativeTheme } from "../theme/nativeTheme";
import { nativeTheme } from "@av/ui";

export function NativeBaseProviderWrapper({
  children,
}: PropsWithChildren) {
  return (
    <NativeBaseProvider theme={nativeTheme}>
      {children}
    </NativeBaseProvider>
  );
}
