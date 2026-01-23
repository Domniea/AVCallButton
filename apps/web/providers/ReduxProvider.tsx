"use client";

import { Provider } from "react-redux";
import { ReactNode, useEffect, useRef } from "react";
import { createStore, AppStore } from "@av/store";
import { rehydrateAuthThunk } from "@av/store/src/auth";

export function ReduxProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  const bootstrappedRef = useRef(false);

  if (!storeRef.current) {
    storeRef.current = createStore();
  }

  useEffect(() => {
    if (!bootstrappedRef.current && storeRef.current) {
      bootstrappedRef.current = true;
      storeRef.current.dispatch(rehydrateAuthThunk());
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
