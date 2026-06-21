import { PropsWithChildren, useRef } from "react";
import axios from "axios";
import Constants from "expo-constants";
import { initApiClient } from "@av/store";

export function ApiProvider({ children }: PropsWithChildren) {
  const initialized = useRef(false);

  if (!initialized.current) {
    const baseURL = Constants.expoConfig?.extra?.API_URL;

    if (!baseURL) {
      throw new Error("API_URL is not configured in Expo config");
    }

    initApiClient(
      axios.create({
        baseURL,
      }),
    );

    initialized.current = true;
  }

  return <>{children}</>;
}
