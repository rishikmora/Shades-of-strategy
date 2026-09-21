/**
 * SITE CONFIG — brand, navigation, SEO and every line of story copy.
 *
 * Editing guide
 * - Change any text between the quotes. Nothing else needs to move.
 * - Wrap words in *asterisks* to set them in the italic serif accent,
 *   e.g. "WITH A *POINT OF VIEW.*"
 * - Keep lines short. Every word must earn its place.
 */

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteConfig = {
  name: "Shades of Strategy",
  shortName: "SOS",
  tagline: "Creative × Technology",

  /** Set NEXT_PUBLIC_SITE_URL in production (e.g. https://yourdomain.com). */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000"),

  seo: {
    title: "Shades of Strategy | Creative & Technology Agency",
    description:
      "Shades of Strategy is a creative and technology agency creating photography, videography, video editing, event coverage, websites, apps and motion experiences.",
    keywords: [
      "Shades of Strategy",
      "SOS",
      "creative agency",
      "technology agency",
      "photography",
      "videography",
      "video editing",
      "event coverage",
      "web development",
      "app development",
      "motion graphics",
    ],
  },

  /** Top navigation. `href` must match a section id on the home page. */
  nav: [
    { label: "Work", href: "#work" },
    { label: "Services", href: "#services" },
    { label: "Packages", href: "#packages" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],

  cta: { label: "Start a project", href: "#contact" },

  /** The opening camera film. Six frames, in order. */
  hero: {
    title: "SHADES OF STRATEGY",
    scrollHint: "Scroll",
    frames: [
      { lines: ["SHADES OF STRATEGY"] },
      { lines: ["EVERYTHING BEGINS", "WITH A *POINT OF VIEW.*"] },
      { lines: ["AN IDEA IS", "ONLY THE *BEGINNING.*"] },
      { lines: ["WE GIVE IT", "*DIRECTION.*"] },
      { lines: ["THEN,", "WE MAKE IT", "*REAL.*"] },
      { lines: ["SHADES OF STRATEGY"], sub: "CREATIVE × TECHNOLOGY" },
    ],
  },

  statement: {
    lines: ["WHERE IDEAS", "FIND THEIR *IDENTITY.*"],
    name: "SHADES OF STRATEGY",
    sub: "Creative + Technology",
  },

  /** IDEA → DIRECTION → IDENTITY → EXPERIENCE */
  story: ["IDEA", "DIRECTION", "IDENTITY", "EXPERIENCE"],

  why: {
    lines: ["ONE IDEA.", "ONE DIRECTION."],
    language: "ONE CREATIVE *LANGUAGE.*",
    path: ["IDEA", "IDENTITY", "EXPERIENCE"],
  },

  about: {
    lines: ["AN IDEA", "DESERVES", "A *FORM.*"],
    body: "Shades of Strategy brings creative production and technology together to turn ideas into identities, experiences and meaningful work.",
  },

  philosophy: {
    lines: ["THE WORLD", "REMEMBERS", "WHAT FEELS", "*REAL.*"],
    answer: ["WE CREATE", "FOR THAT *MOMENT.*"],
  },

  ending: {
    lines: ["SOME IDEAS", "DESERVE", "TO BE *REMEMBERED.*"],
    name: "SHADES OF STRATEGY",
  },

  footer: {
    copyright: "© SOS",
  },
} as const;

export type SiteConfig = typeof siteConfig;
