"use client";

import React from "react";
import { default as AmplifyProvider } from "./AmplifyProvider";
import { ReduxProvider } from "./ReduxProvider";
import { AuthBootstrapProvider } from "./AuthBootstrapProvider";
import { Provider as UIProvider } from "./UIProvider";
import { ApiProvider } from "./ApiProvider";

export default function ClientProviders({ children }: React.PropsWithChildren) {
  console.log("Rendering ClientProviders");
  return (
    <AmplifyProvider>
      <ApiProvider>
        <ReduxProvider>
          <AuthBootstrapProvider>
            <UIProvider>{children}</UIProvider>
          </AuthBootstrapProvider>
        </ReduxProvider>
      </ApiProvider>
    </AmplifyProvider>
  );
}
