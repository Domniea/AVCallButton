"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
import { useSelector } from "react-redux";
import type { RootState } from "@av/store";

export default function InvitePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const authStatus = useSelector((state: RootState) => state.auth.status);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const token = searchParams.get("token");
      if (token) {
        sessionStorage.setItem("inviteToken", token);
      }
    }, [searchParams]);
  
    const acceptInvite = useCallback(async (token: string) => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
  
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invites/accept`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
            const data = await res.json();
            const msg = data.message || data.error;
          
            if (msg?.includes("already a member")) {
              sessionStorage.removeItem("inviteToken");
              router.replace("/home");
              return;
            }
          
            setError(msg || "Failed to accept invite");
            return;
          }

          
        sessionStorage.removeItem("inviteToken");
        router.replace("/home");
      } catch {
        setError("Something went wrong");
      }
    }, [router]);
  
    useEffect(() => {
      if (authStatus === "loading" || authStatus === "idle") return;
  
      const token = sessionStorage.getItem("inviteToken");
      if (!token) {
        setError("No invite token found");
        return;
      }
  
      if (authStatus === "unauthenticated") {
        router.replace("/auth/login");
        return;
      }
  
      if (authStatus === "authenticated") {
        acceptInvite(token);
      }
    }, [authStatus, acceptInvite, router]);

    useEffect(() => {
      if (!error) return;
    
      const timeout = setTimeout(() => {
        router.replace("/home");
      }, 4000);
    
      return () => clearTimeout(timeout);
    }, [error, router]);
  
    if (error) {
      return (
        <div>
          <p>{error}</p>
          <p>Redirecting you to your workspace…</p>
        </div>
      );
    }
    
    return <p>Processing invite...</p>;
  }