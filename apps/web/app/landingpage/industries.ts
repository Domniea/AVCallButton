export type IndustrySlide = {
  id: string;
  label: string;
  description: string;
  /** Path under `apps/web/public/industries` where the images are stored */
  imageSrc: string;
};

export const INDUSTRY_SLIDES: IndustrySlide[] = [
  {
    id: "healthcare",
    label: "Healthcare",
    description: "Clear communication for clinics, hospitals, and patient floors.",
    imageSrc: "/industries/Healthcare.png",
  },
  {
    id: "education",
    label: "Education",
    description: "Campus AV and classrooms that stay simple for staff and students.",
    imageSrc: "/industries/Education.png",
  },
  {
    id: "corporate",
    label: "Corporate",
    description: "Meeting rooms and huddle spaces without a help-desk bottleneck.",
    imageSrc: "/industries/Corporate.png",
  },
  {
    id: "hospitality",
    label: "Hospitality",
    description: "Event venues and guest experiences with reliable call-for-help flows.",
    imageSrc: "/industries/Hospitality.png",
  },
  {
    id: "government",
    label: "Government",
    description: "Public facilities where dependable AV breakout matters.",
    imageSrc: "/industries/Government.png",
  },
];
