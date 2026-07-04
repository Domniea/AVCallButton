"use client";

import { useCallback, useState } from "react";
import { HStack } from "@chakra-ui/react";
import QRCode from "qrcode";

import { BaseButton } from "@/components/reusable/BaseButton";
import { buildGuestCallUrl, guestCallQrFilename } from "@/lib/callLinks";
import { downloadPrintableRoomCallPdf } from "@/lib/printableRoomCallPdf";

type RoomCallLinkActionsProps = {
  roomName: string;
  callToken: string;
  eventName: string;
  zoneName?: string | null;
};

export function RoomCallLinkActions({
  roomName,
  callToken,
  eventName,
  zoneName,
}: RoomCallLinkActionsProps) {
  const [copyLabel, setCopyLabel] = useState("Copy link");
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const callUrl = buildGuestCallUrl(callToken);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(callUrl);
      setCopyLabel("Copied!");
      window.setTimeout(() => setCopyLabel("Copy link"), 2000);
    } catch {
      setCopyLabel("Copy failed");
      window.setTimeout(() => setCopyLabel("Copy link"), 2000);
    }
  }, [callUrl]);

  const handleDownloadQr = useCallback(async () => {
    setIsDownloadingQr(true);
    try {
      const dataUrl = await QRCode.toDataURL(callUrl, {
        width: 512,
        margin: 2,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = guestCallQrFilename(roomName);
      link.click();
    } finally {
      setIsDownloadingQr(false);
    }
  }, [callUrl, roomName]);

  const handleDownloadPdf = useCallback(async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadPrintableRoomCallPdf({
        roomName,
        callToken,
        eventName,
        zoneName,
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  }, [callToken, eventName, roomName, zoneName]);

  return (
    <HStack gap={2} flexWrap="wrap" mt={2}>
      <BaseButton
        variety="tertiary"
        title={copyLabel}
        btnWidth="auto"
        onClick={handleCopyLink}
      />
      <BaseButton
        variety="tertiary"
        title={isDownloadingQr ? "Saving…" : "Download QR"}
        btnWidth="auto"
        disabled={isDownloadingQr}
        onClick={handleDownloadQr}
      />
      <BaseButton
        variety="tertiary"
        title={isDownloadingPdf ? "Saving…" : "Download PDF"}
        btnWidth="auto"
        disabled={isDownloadingPdf}
        onClick={handleDownloadPdf}
      />
    </HStack>
  );
}
