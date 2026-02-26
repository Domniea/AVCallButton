// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { fetchAuthSession } from "aws-amplify/auth";
// import { useSelector } from "react-redux";
// import type { RootState } from "@av/store";

// export default function InvitePage() {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const authStatus = useSelector((state: RootState) => state.auth.status);
//     const [error, setError] = useState<string | null>(null);
  
//     useEffect(() => {
//       const token = searchParams.get("token");
//       if (token) {
//         sessionStorage.setItem("inviteToken", token);
//       }
//     }, [searchParams]);
  
//     const acceptInvite = useCallback(async (token: string) => {
//       try {
//         const session = await fetchAuthSession();
//         const idToken = session.tokens?.idToken?.toString();
  
//         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invites/accept`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${idToken}`,
//           },
//           body: JSON.stringify({ token }),
//         });
  
//         if (!res.ok) {
//           const data = await res.json();
//           setError(data.message || "Failed to accept invite");
//           return;
//         }
  
//         const data = await res.json();
//         sessionStorage.removeItem("inviteToken");
//         router.replace(`/workspaces/${data.membership.workspaceId}`);
//       } catch {
//         setError("Something went wrong");
//       }
//     }, [router]);
  
//     useEffect(() => {
//       if (authStatus === "loading" || authStatus === "idle") return;
  
//       const token = sessionStorage.getItem("inviteToken");
//       if (!token) {
//         setError("No invite token found");
//         return;
//       }
  
//       if (authStatus === "unauthenticated") {
//         router.replace("/auth/login");
//         return;
//       }
  
//       if (authStatus === "authenticated") {
//         acceptInvite(token);
//       }
//     }, [authStatus, acceptInvite, router]);
  
//     if (error) return <p>{error}</p>;
//     return <p>Processing invite...</p>;
//   }
import { Suspense } from "react";
import InviteClient from "./InviteClient";

export default function InvitePage() {
  return (
    <Suspense fallback={<p>Loading invite...</p>}>
      <InviteClient />
    </Suspense>
  );
}