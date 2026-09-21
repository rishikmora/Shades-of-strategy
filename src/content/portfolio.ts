/**
 * PORTFOLIO — "What we create" and the project story pages (/work/[slug]).
 *
 * ⚠️  The entries below are SAMPLE ENTRIES with generated artwork so the layout
 *     can be seen. Replace them with real projects before launch.
 *
 * Editing guide
 * - `slug` becomes the page address: /work/<slug> (lowercase, dashes, no spaces).
 * - `line` is ONE short sentence.
 * - `cover` and `gallery` accept:
 *     { type: "image", src: "/work/my-project/cover.jpg", alt: "…" }
 *     { type: "video", src: "/work/my-project/film.mp4", poster: "/work/my-project/poster.jpg", alt: "…" }
 *     { type: "generated", variant: "aperture", alt: "…" }   ← placeholder artwork
 *   Put image/video files inside the /public folder. Images are automatically
 *   served as AVIF/WebP at the right size.
 * - `created` is the short "What we created" list.
 */

export type GeneratedVariant =
  | "aperture"
  | "anamorphic"
  | "timeline"
  | "frame"
  | "device"
  | "kinetic";

export type Media =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; poster?: string; alt: string }
  | { type: "generated"; variant: GeneratedVariant; alt: string; seed?: number };

export type PortfolioCategory =
  | "Photography"
  | "Videography"
  | "Video Editing"
  | "Web"
  | "Apps"
  | "Motion";

export type Project = {
  slug: string;
  title: string;
  category: PortfolioCategory;
  line: string;
  cover: Media;
  gallery: Media[];
  created: string[];
};

export const portfolioIntro = {
  eyebrow: "Work",
  lines: ["WHAT WE", "*CREATE.*"],
  open: "View project",
  createdTitle: "What we created",
  next: "Next project",
  back: "All work",
};

export const projects: Project[] = [
  // SAMPLE ENTRY — replace with a real project
  {
    slug: "still-in-red",
    title: "Still in Red",
    category: "Photography",
    line: "One object. One light. Nothing else.",
    cover: { type: "generated", variant: "aperture", alt: "An aperture iris lit in deep red" },
    gallery: [
      { type: "generated", variant: "aperture", seed: 2, alt: "Aperture blades closing around a red point of light" },
      { type: "generated", variant: "aperture", seed: 3, alt: "A red point of light in black space" },
    ],
    created: ["Art direction", "Studio photography", "Retouching"],
  },
  // SAMPLE ENTRY — replace with a real project
  {
    slug: "after-dark",
    title: "After Dark",
    category: "Videography",
    line: "A night, told one frame at a time.",
    cover: { type: "generated", variant: "anamorphic", alt: "A red anamorphic light streak across a cinematic frame" },
    gallery: [
      { type: "generated", variant: "anamorphic", seed: 2, alt: "Letterboxed frame with a horizon of red light" },
      { type: "generated", variant: "anamorphic", seed: 3, alt: "Soft red light fading into black" },
    ],
    created: ["Direction", "Cinematography", "Colour grade"],
  },
  // SAMPLE ENTRY — replace with a real project
  {
    slug: "the-cut",
    title: "The Cut",
    category: "Video Editing",
    line: "Hours of footage, shaped into one minute.",
    cover: { type: "generated", variant: "timeline", alt: "Edit timeline tracks with a red playhead" },
    gallery: [
      { type: "generated", variant: "timeline", seed: 2, alt: "Clips aligning on a timeline" },
      { type: "generated", variant: "timeline", seed: 3, alt: "A single red cut mark" },
    ],
    created: ["Edit", "Sound design", "Colour"],
  },
  // SAMPLE ENTRY — replace with a real project
  {
    slug: "a-place-to-live",
    title: "A Place to Live",
    category: "Web",
    line: "An identity, given an address.",
    cover: { type: "generated", variant: "frame", alt: "A browser frame floating in black space" },
    gallery: [
      { type: "generated", variant: "frame", seed: 2, alt: "Layers of an interface separating in depth" },
      { type: "generated", variant: "frame", seed: 3, alt: "A minimal page grid lit in red" },
    ],
    created: ["Design", "Development", "Motion"],
  },
  // SAMPLE ENTRY — replace with a real project
  {
    slug: "in-hand",
    title: "In Hand",
    category: "Apps",
    line: "The experience, one tap away.",
    cover: { type: "generated", variant: "device", alt: "A phone silhouette with a red-lit screen" },
    gallery: [
      { type: "generated", variant: "device", seed: 2, alt: "A phone edge catching red light" },
      { type: "generated", variant: "device", seed: 3, alt: "An app interface glowing in the dark" },
    ],
    created: ["Product design", "iOS & Android", "Launch"],
  },
  // SAMPLE ENTRY — replace with a real project
  {
    slug: "identity-in-motion",
    title: "Identity in Motion",
    category: "Motion",
    line: "A mark that knows how to move.",
    cover: { type: "generated", variant: "kinetic", alt: "The letters S O S in motion" },
    gallery: [
      { type: "generated", variant: "kinetic", seed: 2, alt: "Letterforms sliding through red light" },
      { type: "generated", variant: "kinetic", seed: 3, alt: "A single letter frozen mid-motion" },
    ],
    created: ["Motion system", "Logo animation", "Type in motion"],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
