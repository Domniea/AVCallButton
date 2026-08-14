export type IndustrySlide = {
  id: string;
  label: string;
  description: string;
  /** Path under `apps/web/public/industries` where the images are stored */
  imageSrc: string;
  icon: "education" | "healthcare" | "corporate" | "hospitality" | "government";
};

export const INDUSTRY_SLIDES: IndustrySlide[] = [
  {
    id: "education",
    label: "Education",
    description:
      "Campus AV and classrooms that stay simple for staff and students.",
    imageSrc: "/industries/Education.png",
    icon: "education",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    description:
      "Clear communication for clinics, hospitals, and patient floors.",
    imageSrc: "/industries/Healthcare.png",
    icon: "healthcare",
  },
  {
    id: "corporate",
    label: "Corporate",
    description:
      "Meeting rooms and huddle spaces without a help-desk bottleneck.",
    imageSrc: "/industries/Corporate.png",
    icon: "corporate",
  },
  {
    id: "hospitality",
    label: "Hospitality",
    description:
      "Event venues and guest experiences with reliable call-for-help flows.",
    imageSrc: "/industries/Hospitality.png",
    icon: "hospitality",
  },
  {
    id: "government",
    label: "Government",
    description: "Public facilities where dependable AV breakout matters.",
    imageSrc: "/industries/Government.png",
    icon: "government",
  },
];
