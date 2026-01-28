"use client";

import { ReactNode, useRef } from "react";
import axios from "axios";
import { initApiClient } from "@av/store";

export function ApiProvider({ children }: { children: ReactNode }) {
  const initialized = useRef(false);

  if (!initialized.current) {
    const baseURL = process.env.NEXT_PUBLIC_API_URL;

    if (!baseURL) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }

    initApiClient(
      axios.create({
        baseURL,
      })
    );

    initialized.current = true;
  }

  return <>{children}</>;
}
