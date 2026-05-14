"use client";

import { Provider } from "react-redux";
import { ReactNode, useRef } from "react";
import { createStore, AppStore } from "@av/store";

export function ReduxProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createStore();
  }
  
  return <Provider store={storeRef.current}>{children}</Provider>;
}
