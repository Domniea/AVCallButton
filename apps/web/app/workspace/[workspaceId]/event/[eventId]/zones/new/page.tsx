"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Legacy route — opens create zone on the event page. */
export default function CreateZoneRedirectPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const eventId = params.eventId as string;
  const router = useRouter();

  useEffect(() => {
    router.replace(
      `/workspace/${workspaceId}/event/${eventId}?createZone=1`,
    );
  }, [workspaceId, eventId, router]);

  return null;
}
