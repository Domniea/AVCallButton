import { jsPDF } from "jspdf";
import QRCode from "qrcode";

import { buildGuestCallUrl, guestCallQrFilename } from "./callLinks";

export type PrintableRoomCallSign = {
  roomName: string;
  callToken: string;
  eventName: string;
  zoneName?: string | null;
};

function guestCallPdfFilename(roomName: string): string {
  return guestCallQrFilename(roomName).replace(/\.png$/, ".pdf");
}

function locationLine(sign: PrintableRoomCallSign): string {
  if (sign.zoneName?.trim()) {
    return `${sign.zoneName.trim()} · ${sign.roomName}`;
  }
  return sign.roomName;
}

/** Build a single-page letter-size PDF sign with room info and scannable QR. */
export async function downloadPrintableRoomCallPdf(
  sign: PrintableRoomCallSign,
): Promise<void> {
  const callUrl = buildGuestCallUrl(sign.callToken);
  const qrDataUrl = await QRCode.toDataURL(callUrl, {
    width: 800,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;
  let y = 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text("AV Call Button", centerX, y, { align: "center" });

  y += 16;
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Need AV help?", centerX, y, { align: "center" });

  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(sign.eventName, centerX, y, { align: "center" });

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  const location = locationLine(sign);
  const locationLines = doc.splitTextToSize(location, pageWidth - 40);
  doc.text(locationLines, centerX, y, { align: "center" });
  y += locationLines.length * 9 + 8;

  const qrSize = 110;
  const qrX = centerX - qrSize / 2;
  doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);
  y += qrSize + 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text("Scan with your phone camera", centerX, y, { align: "center" });

  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(80);
  const urlLines = doc.splitTextToSize(callUrl, pageWidth - 30);
  doc.text(urlLines, centerX, y, { align: "center" });

  doc.save(guestCallPdfFilename(sign.roomName));
}
