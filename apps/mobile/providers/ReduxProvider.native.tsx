
import { PropsWithChildren, useEffect, useRef } from "react";
import { Provider } from "react-redux";

import { createStore } from "@av/store";
import { bootstrapAuthNative } from "@av/store/src/bootstrapers/authBootstrap.native"

const store = createStore();

export function ReduxProvider({ children }: PropsWithChildren) {
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (!bootstrappedRef.current) {
      bootstrappedRef.current = true;
      bootstrapAuthNative(store.dispatch);
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
