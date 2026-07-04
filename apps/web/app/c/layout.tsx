import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Request AV Help",
  description: "Request technical assistance for this room",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function GuestCallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
