import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
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
    <View style={styles.stack}>
      <Text style={[styles.help, { color: muted }]}>
        Share, print, or post this link so guests can request AV help from this
        room.
      </Text>

      <View style={styles.qrWrap}>
        <QRCode value={callUrl} size={200} backgroundColor="white" />
      </View>

      <Text style={[styles.url, { color: muted }]}>{callUrl}</Text>

      <View style={styles.actions}>
        <View style={styles.row}>
          <View style={styles.half}>
            <BaseButton
              variety="secondary"
              title={copyLabel}
              onPress={() => void handleCopyLink()}
            />
          </View>
          <View style={styles.half}>
            <BaseButton
              variety="tertiary"
              title="Share link"
              onPress={() => void handleShareLink()}
            />
          </View>
        </View>
        <BaseButton
          variety="tertiary"
          title={isSharingPdf ? "Preparing…" : "Share PDF sign"}
          isDisabled={isSharingPdf}
          onPress={() => void handleSharePdf()}
        />
      </View>

      {actionError ? (
        <Text style={styles.error}>{actionError}</Text>
      ) : null}

      <Text style={[styles.tip, { color: text }]}>
        Tip: use Share PDF sign to AirDrop or print a door poster.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 16,
    alignItems: "stretch",
  },
  help: {
    fontSize: 14,
  },
  qrWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  url: {
    fontSize: 12,
    textAlign: "center",
  },
  actions: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  half: {
    flex: 1,
    minWidth: 140,
  },
  error: {
    fontSize: 14,
    color: "#EF4444",
  },
  tip: {
    fontSize: 12,
    opacity: 0.7,
  },
});
