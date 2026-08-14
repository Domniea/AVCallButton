export type FeatureItem = {
  id: string;
  title: string;
  description: string;
  icon: "alerts" | "rooms" | "team" | "insights";
};

export const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: "alerts",
    title: "Real-time Alerts",
    description: "Instant notifications across teams and locations.",
    icon: "alerts",
  },
  {
    id: "rooms",
    title: "Room & Zone Control",
    description: "Manage rooms, devices, and zones with ease.",
    icon: "rooms",
  },
  {
    id: "team",
    title: "Team Coordination",
    description: "Keep your crew aligned and on task.",
    icon: "team",
  },
  {
    id: "insights",
    title: "Actionable Insights",
    description: "Track activity and performance with powerful reporting.",
    icon: "insights",
  },
];
