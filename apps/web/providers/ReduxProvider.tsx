"use client";

import { Provider } from "react-redux";
import { ReactNode, useEffect, useRef } from "react";
import { createStore, AppStore } from "@av/store";
import { bootstrapAuthWeb } from "@av/store";

export function ReduxProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  const bootstrappedRef = useRef(false);

  if (!storeRef.current) {
    storeRef.current = createStore();
  }

  useEffect(() => {
    if (!bootstrappedRef.current && storeRef.current) {
      bootstrappedRef.current = true;
      bootstrapAuthWeb(storeRef.current.dispatch);
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
