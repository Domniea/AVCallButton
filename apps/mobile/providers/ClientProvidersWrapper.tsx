import { PropsWithChildren } from "react";

import { AmplifyProvider } from "./AmplifyProvider.native";
import { ReduxProvider } from "./ReduxProvider.native";
import { GluestackProviderWrapper } from "./GluestackProvider.native";
import { AuthBootstrapProvider } from "./AuthBootstrapProvider";
import { PushRegistrationProvider } from "./PushRegistrationProvider";
import { ApiProvider } from "./ApiProvider";

export function ClientProviders({ children }: PropsWithChildren) {
  return (
    <GluestackProviderWrapper>
      <AmplifyProvider>
        <ApiProvider>
          <ReduxProvider>
            <AuthBootstrapProvider>
              <PushRegistrationProvider>{children}</PushRegistrationProvider>
            </AuthBootstrapProvider>
          </ReduxProvider>
        </ApiProvider>
      </AmplifyProvider>
    </GluestackProviderWrapper>
  );
}
