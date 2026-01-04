import { PropsWithChildren } from "react";

import { AmplifyProvider } from "./AmplifyProvider.native";
import { ReduxProvider } from "./ReduxProvider.native";
import { NativeBaseProviderWrapper } from "./NativeBaseProvider.native";

export function ClientProviders({ children }: PropsWithChildren) {
  return (
    <NativeBaseProviderWrapper>
      <AmplifyProvider>
        <ReduxProvider>{children}</ReduxProvider>
      </AmplifyProvider>
    </NativeBaseProviderWrapper>
  );
}
