import { PropsWithChildren } from "react";

import { AmplifyProvider } from "./AmplifyProvider.native";
import { ReduxProvider } from "./ReduxProvider.native";
import { NativeBaseProviderWrapper } from "./NativeBaseProvider.native";
import { AuthBootstrapProvider } from "./AuthBootstrapProvider";
import { ApiProvider } from "./ApiProvider";

export function ClientProviders({ children }: PropsWithChildren) {
  return (
    <NativeBaseProviderWrapper>
      <AmplifyProvider>
        <ApiProvider>
          <ReduxProvider>
            <AuthBootstrapProvider>{children}</AuthBootstrapProvider>
          </ReduxProvider>
        </ApiProvider>
      </AmplifyProvider>
    </NativeBaseProviderWrapper>
  );
}
