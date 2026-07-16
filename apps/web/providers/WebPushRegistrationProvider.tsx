"use client";

import { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { fetchAuthSession } from "aws-amplify/auth";
import type { RootState } from "@av/store";

import { registerForWebPush } from "@/lib/push/registerWebPush";

export function WebPushRegistrationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const status = useSelector((state: RootState) => state.auth.status);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    let cancelled = false;

    void (async () => {
      try {
        const session = await fetchAuthSession();
        const authToken = session.tokens?.idToken?.toString();
        if (!authToken || cancelled) return;

        await registerForWebPush(authToken);
      } catch (error) {
        console.error("Failed to register for web push:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, userId]);

  return <>{children}</>;
}
