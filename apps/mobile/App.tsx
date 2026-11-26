import "react-native-get-random-values";

import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { ClientProviders } from "./providers/ClientProvidersWrapper";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  useEffect(() => {
    if (!__DEV__) return;
    const g = globalThis as typeof globalThis & {
      onunhandledrejection?: ((event: {
        reason?: unknown;
      }) => void) | null;
    };
    const previous = g.onunhandledrejection;
    g.onunhandledrejection = (event) => {
      const reason = event?.reason;
      console.error(
        "[unhandledRejection]",
        reason,
        reason instanceof Error ? reason.stack : undefined,
      );
      previous?.(event);
    };
    return () => {
      g.onunhandledrejection = previous ?? null;
    };
  }, []);

  return (
    <ClientProviders>
      <RootNavigator />
    </ClientProviders>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
