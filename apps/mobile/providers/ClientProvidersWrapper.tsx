import { PropsWithChildren } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AmplifyProvider } from "./AmplifyProvider.native";
import { ReduxProvider } from "./ReduxProvider.native";
import { GluestackProviderWrapper } from "./GluestackProvider.native";
import { AuthBootstrapProvider } from "./AuthBootstrapProvider";
import { PushRegistrationProvider } from "./PushRegistrationProvider";
import { ApiProvider } from "./ApiProvider";

export function ClientProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}
