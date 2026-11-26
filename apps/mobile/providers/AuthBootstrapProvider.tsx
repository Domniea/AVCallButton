import { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@av/store";
import { rehydrateAuthThunk, fetchMeThunk } from "@av/store/src/auth";

export function AuthBootstrapProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector((state: RootState) => state.auth.status);

  useEffect(() => {
    if (status !== "idle") return;

    void dispatch(rehydrateAuthThunk())
      .then((res) => {
        if (rehydrateAuthThunk.fulfilled.match(res)) {
          return dispatch(fetchMeThunk());
        }
        return undefined;
      })
      .catch((err) => {
        console.error("Auth bootstrap failed:", err);
      });
  }, [status, dispatch]);


  return <>{children}</>;
}
