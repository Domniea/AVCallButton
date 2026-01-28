import { PropsWithChildren, useEffect } from "react";
import axios from "axios";
import Constants from "expo-constants";
import { initApiClient } from "@av/store";

export function ApiProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const baseURL = Constants.expoConfig?.extra?.API_URL;

    console.log(baseURL)
    if (!baseURL) {
      throw new Error("API_URL is not configured in Expo config");
    }

    const api = axios.create({
      baseURL,
    });

    initApiClient(api);
  }, []);

  return <>{children}</>;
}
