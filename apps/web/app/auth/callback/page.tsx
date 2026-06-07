"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";

export default function AuthCallbackPage() {
  const router = useRouter();

  
  useEffect(() => {
    console.log('ran Auth auth callback page')
    async function completeAuth() {
      try {
 
        await fetchAuthSession();

        router.replace("/");
      } catch (err) {
        console.error("Auth callback failed:", err);
        router.replace("auth/login");
      }
    }

    completeAuth();
  }, [router]);

  return <p>Signing you in…</p>;
}
