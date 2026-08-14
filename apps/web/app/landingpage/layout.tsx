import React from "react";

import LandingHeader from "./LandingHeader";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="chakra-theme dark"
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "var(--chakra-colors-primary-900)",
        color: "var(--chakra-colors-text)",
      }}
    >
      <LandingHeader />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          maxWidth: "80rem",
          marginInline: "auto",
          paddingInline: "clamp(1rem, 4vw, 1.5rem)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
