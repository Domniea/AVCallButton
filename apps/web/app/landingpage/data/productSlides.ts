export type ProductSlide = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
};

export const PRODUCT_SLIDES: ProductSlide[] = [
  {
    id: "zones",
    title: "Zone Management",
    description: "Organize rooms and zones across your entire venue.",
    imageSrc: "/landing/dashboard-zones.svg",
  },
  {
    id: "overview",
    title: "Overview Dashboard",
    description:
      "Monitor alerts, rooms, and crew status from a single command view.",
    imageSrc: "/landing/dashboard-overview.svg",
  },
  {
    id: "room",
    title: "Room Details",
    description: "Drill into device health and activity for any room.",
    imageSrc: "/landing/dashboard-room.svg",
  },
];
