import React from "react";

import HeroSection from "./sections/HeroSection";
import IndustryRolodexSection from "./sections/IndustryRolodexSection";
import FeatureSection from "./sections/FeatureSection";

const sectionStackStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "clamp(1rem, 2vw, 1.25rem)",
  height: "100%",
  minHeight: 0,
  paddingBlock: "clamp(0.75rem, 2vw, 1rem)",
};

export default function LandingPage() {
  return (
    <div style={sectionStackStyle}>
      <div
        style={{
          flex: "1.2 1 0",
          minHeight: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <HeroSection />
      </div>

      <div
        id="industries"
        style={{
          flex: "0 1 auto",
          minHeight: 0,
          maxHeight: "min(42vh, 360px)",
          width: "100%",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        <IndustryRolodexSection />
      </div>

      <div
        id="features"
        style={{
          flex: "0.55 1 0",
          minHeight: 0,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <FeatureSection />
      </div>
    </div>
  );
}
