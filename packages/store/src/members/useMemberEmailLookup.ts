import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

import {
  lookupMemberByEmail,
  type MemberLookupFound,
} from "../api/members.api";

export type MemberEmailLookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found"; result: MemberLookupFound }
  | { status: "not_found"; email: string }
  | { status: "error"; message: string };

const LOOKUP_DEBOUNCE_MS = 400;

function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function useMemberEmailLookup(
  workspaceId: string | undefined,
  email: string,
  enabled: boolean,
) {
  const [lookup, setLookup] = useState<MemberEmailLookupState>({ status: "idle" });
  const requestId = useRef(0);

  useEffect(() => {
    if (!enabled || !workspaceId) {
      setLookup((prev) => (prev.status === "idle" ? prev : { status: "idle" }));
      return;
    }

    const trimmed = email.trim();
    if (!isPlausibleEmail(trimmed)) {
      setLookup((prev) => (prev.status === "idle" ? prev : { status: "idle" }));
      return;
    }

    const id = ++requestId.current;
    const timer = setTimeout(() => {
      void (async () => {
        setLookup({ status: "loading" });
        try {
          const session = await fetchAuthSession();
          const token = session.tokens?.idToken?.toString();
          if (!token) {
            if (id === requestId.current) {
              setLookup({ status: "error", message: "Not signed in." });
            }
            return;
          }

          const result = await lookupMemberByEmail(token, workspaceId, trimmed);
          if (id !== requestId.current) return;

          if (result.found) {
            setLookup({ status: "found", result });
          } else {
            setLookup({ status: "not_found", email: result.email });
          }
        } catch {
          if (id === requestId.current) {
            setLookup({
              status: "error",
              message: "Could not look up this email. Try again.",
            });
          }
        }
      })();
    }, LOOKUP_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [workspaceId, email, enabled]);

  const resetLookup = useCallback(() => {
    requestId.current += 1;
    setLookup((prev) => (prev.status === "idle" ? prev : { status: "idle" }));
  }, []);

  return { lookup, resetLookup };
}
