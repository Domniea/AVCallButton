import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import QRCode from "qrcode";

import { buildGuestCallUrl, guestCallPdfFilename } from "./callLinks";

export type PrintableRoomCallSign = {
  roomName: string;
  callToken: string;
  eventName: string;
  zoneName?: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function locationLine(sign: PrintableRoomCallSign): string {
  if (sign.zoneName?.trim()) {
    return `${sign.zoneName.trim()} · ${sign.roomName}`;
  }
  return sign.roomName;
}

function buildSignHtml(sign: PrintableRoomCallSign, callUrl: string, qrSvg: string): string {
  const location = escapeHtml(locationLine(sign));
  const eventName = escapeHtml(sign.eventName);
  const url = escapeHtml(callUrl);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page { size: letter; margin: 28mm 20mm; }
      body {
        font-family: -apple-system, Helvetica, Arial, sans-serif;
        text-align: center;
        color: #111;
      }
      .brand { font-size: 14px; color: #666; margin-bottom: 24px; }
      .headline { font-size: 34px; font-weight: 700; margin: 0 0 16px; }
      .event { font-size: 18px; margin: 0 0 10px; }
      .location { font-size: 24px; font-weight: 700; margin: 0 0 28px; }
      .qr { width: 280px; height: 280px; margin: 0 auto 20px; }
      .qr svg { width: 100%; height: 100%; }
      .hint { font-size: 16px; margin: 0 0 10px; }
      .url { font-size: 12px; color: #555; word-break: break-all; }
    </style>
  </head>
  <body>
    <p class="brand">AV Call Button</p>
    <h1 class="headline">Need AV help?</h1>
    <p class="event">${eventName}</p>
    <p class="location">${location}</p>
    <div class="qr">${qrSvg}</div>
    <p class="hint">Scan with your phone camera</p>
    <p class="url">${url}</p>
  </body>
</html>`;
}

/** Build a printable room sign and open the system share sheet. */
export async function sharePrintableRoomCallPdf(
  sign: PrintableRoomCallSign,
): Promise<void> {
  const callUrl = buildGuestCallUrl(sign.callToken);
  // SVG works in RN; toDataURL needs a canvas (DOM/Node only).
  const qrSvg = await QRCode.toString(callUrl, {
    type: "svg",
    width: 800,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  const html = buildSignHtml(sign, callUrl, qrSvg);
  const file = await Print.printToFileAsync({ html });

  if (!(await Sharing.isAvailableAsync())) {
    await Print.printAsync({ html });
    return;
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: "application/pdf",
    dialogTitle: guestCallPdfFilename(sign.roomName),
    UTI: "com.adobe.pdf",
  });
}
