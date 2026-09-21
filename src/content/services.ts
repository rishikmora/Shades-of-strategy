/**
 * SERVICES — shown in the "We make ideas visible" section.
 *
 * Editing guide
 * - `name` and `line` are free text. Keep `line` to one short sentence.
 * - `visual` picks the 3D object shown on hover. Allowed values:
 *   "photography" | "videography" | "editing" | "event" | "web" | "apps" | "motion"
 * - Reorder the list to reorder the section. Numbers update automatically.
 */

export type ServiceVisual =
  | "photography"
  | "videography"
  | "editing"
  | "event"
  | "web"
  | "apps"
  | "motion";

export type Service = {
  id: string;
  name: string;
  line: string;
  visual: ServiceVisual;
};

export const servicesIntro = {
  eyebrow: "Services",
  lines: ["WE MAKE IDEAS", "*VISIBLE.*"],
};

export const services: Service[] = [
  {
    id: "photography",
    name: "Photography",
    line: "Freeze what matters.",
    visual: "photography",
  },
  {
    id: "videography",
    name: "Videography",
    line: "Give stories movement.",
    visual: "videography",
  },
  {
    id: "video-editing",
    name: "Video Editing",
    line: "Shape every frame.",
    visual: "editing",
  },
  {
    id: "event-coverage",
    name: "Event Coverage",
    line: "Preserve the moment.",
    visual: "event",
  },
  {
    id: "web",
    name: "Web",
    line: "Give the idea a place to live.",
    visual: "web",
  },
  {
    id: "apps",
    name: "Apps",
    line: "Turn the experience into something people can use.",
    visual: "apps",
  },
  {
    id: "motion",
    name: "Motion",
    line: "Make the identity move.",
    visual: "motion",
  },
];
