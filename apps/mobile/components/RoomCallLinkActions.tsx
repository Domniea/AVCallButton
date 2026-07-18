import React, { useCallback, useState } from "react";
import { Box, HStack, Text, VStack } from "native-base";
import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { BaseButton } from "./BaseButton";
import { useThemeColors } from "../hooks/useThemeColors";
import { buildGuestCallUrl } from "../src/lib/callLinks";
import { sharePrintableRoomCallPdf } from "../src/lib/printableRoomCallPdf";

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
  const { muted, text } = useThemeColors();
  const [copyLabel, setCopyLabel] = useState("Copy link");
  const [isSharingPdf, setIsSharingPdf] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const callUrl = buildGuestCallUrl(callToken);

  const handleCopyLink = useCallback(async () => {
    setActionError(null);
    try {
      await Clipboard.setStringAsync(callUrl);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy link"), 2000);
    } catch {
      setCopyLabel("Copy failed");
      setTimeout(() => setCopyLabel("Copy link"), 2000);
    }
  }, [callUrl]);

  const handleShareLink = useCallback(async () => {
    setActionError(null);
    try {
      await Share.share({
        message: `AV help for ${roomName}: ${callUrl}`,
        url: callUrl,
      });
    } catch {
      setActionError("Could not open share sheet.");
    }
  }, [callUrl, roomName]);

  const handleSharePdf = useCallback(async () => {
    setActionError(null);
    setIsSharingPdf(true);
    try {
      await sharePrintableRoomCallPdf({
        roomName,
        callToken,
        eventName,
        zoneName,
      });
    } catch (error) {
      console.error("Failed to share room call PDF:", error);
      setActionError("Could not create the PDF sign.");
    } finally {
      setIsSharingPdf(false);
    }
  }, [callToken, eventName, roomName, zoneName]);

  return (
    <VStack space={4} alignItems="stretch">
      <Text fontSize="sm" color={muted}>
        Share, print, or post this link so guests can request AV help from this
        room.
      </Text>

      <Box alignItems="center" py={2}>
        <QRCode value={callUrl} size={200} backgroundColor="white" />
      </Box>

      <Text fontSize="xs" color={muted} textAlign="center">
        {callUrl}
      </Text>

      <VStack space={2}>
        <HStack space={2} flexWrap="wrap">
          <Box flex={1} minW="140px">
            <BaseButton
              variety="secondary"
              title={copyLabel}
              onPress={() => void handleCopyLink()}
            />
          </Box>
          <Box flex={1} minW="140px">
            <BaseButton
              variety="tertiary"
              title="Share link"
              onPress={() => void handleShareLink()}
            />
          </Box>
        </HStack>
        <BaseButton
          variety="tertiary"
          title={isSharingPdf ? "Preparing…" : "Share PDF sign"}
          isDisabled={isSharingPdf}
          onPress={() => void handleSharePdf()}
        />
      </VStack>

      {actionError ? (
        <Text fontSize="sm" color="red.500">
          {actionError}
        </Text>
      ) : null}

      <Text fontSize="xs" color={text} opacity={0.7}>
        Tip: use Share PDF sign to AirDrop or print a door poster.
      </Text>
    </VStack>
  );
}
