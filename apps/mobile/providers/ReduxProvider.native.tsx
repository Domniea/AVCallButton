import { PropsWithChildren, useEffect, useRef } from "react";
import { Provider } from "react-redux";

import { createStore } from "@av/store";
import { rehydrateAuthThunk } from "@av/store/src/auth";

const store = createStore();

export function ReduxProvider({ children }: PropsWithChildren) {
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (!bootstrappedRef.current) {
      bootstrappedRef.current = true;
      store.dispatch(rehydrateAuthThunk());
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
