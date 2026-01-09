"use client";

import React from "react";
import {
  AmplifyProvider,
  ReduxProvider,
  UIProvider,
} from "../providers";

export default function ClientProviders({
  children,
}: React.PropsWithChildren) {
  console.log("Rendering ClientProviders");
  return (
    <AmplifyProvider>
      <ReduxProvider>
        <UIProvider>{children}</UIProvider>
      </ReduxProvider>
    </AmplifyProvider>
  );
}
