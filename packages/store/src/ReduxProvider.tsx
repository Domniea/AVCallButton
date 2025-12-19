"use client";

import { Provider } from "react-redux";
import { ReactNode, useEffect, useRef } from "react";
import { createStore, AppStore } from "./store";
import { bootstrapAuth } from "./bootstrap/authBootstrap";

export function ReduxProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  const bootstrappedRef = useRef(false);

  if (!storeRef.current) {
    storeRef.current = createStore();
  }

  useEffect(() => {
    if (!bootstrappedRef.current && storeRef.current) {
      bootstrappedRef.current = true;
      bootstrapAuth(storeRef.current.dispatch);
    }
  }, []);

  return storeRef.current ? (
    <Provider store={storeRef.current}>{children}</Provider>
  ) : null;
}
