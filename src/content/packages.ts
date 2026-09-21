/**
 * PACKAGES & ADD-ONS
 *
 * Editing guide
 * - `price` is a plain number (no commas, no symbol): 19999 → shows as ₹19,999
 * - Add, remove or reorder items in `includes` freely.
 * - `unit` is optional, e.g. "video" → "₹1,999 / video".
 */

export const currency = {
  symbol: "₹",
  code: "INR",
  locale: "en-IN",
};

export type Package = {
  id: string;
  name: string;
  price: number;
  includes: string[];
};

export const packagesIntro = {
  eyebrow: "Packages",
  lines: ["CHOOSE YOUR", "*SCALE.*"],
  note: "Prices are reasonably negotiable based on project scope and requirements.",
  cta: "Start with",
};

export const packages: Package[] = [
  {
    id: "essential",
    name: "Essential",
    price: 19999,
    includes: ["Photography", "Videography", "Video Editing", "Website Content"],
  },
  {
    id: "signature",
    name: "Signature",
    price: 39999,
    includes: [
      "Photography",
      "Videography",
      "Video Editing",
      "1 Reel",
      "Event Coverage",
      "Website Content",
      "Motion Graphics",
    ],
  },
  {
    id: "brand-launch",
    name: "Brand Launch",
    price: 59999,
    includes: [
      "Brand Naming",
      "Logo Design",
      "Brand Story",
      "Photography",
      "Videography",
      "Video Editing",
      "2 Reels",
      "Website Development",
    ],
  },
  {
    id: "complete",
    name: "Complete",
    price: 89999,
    includes: [
      "Brand Identity",
      "Photography",
      "Videography",
      "Cinematic Videos",
      "Video Editing",
      "5 Reels",
      "Event Coverage",
      "Motion Graphics",
      "Website Development",
      "App Development",
    ],
  },
];

export type AddOn = { name: string; price: number; unit?: string };

export const addOnsIntro = {
  title: "Optional",
  subtitle: "Add-ons",
};

export const addOns: AddOn[] = [
  { name: "Photography", price: 2999 },
  { name: "Videography", price: 4999 },
  { name: "Video Editing", price: 1999, unit: "video" },
  { name: "Event Coverage", price: 5999 },
  { name: "Website", price: 9999 },
  { name: "App Development", price: 19999 },
  { name: "Motion", price: 3999 },
];

export function formatPrice(value: number) {
  return `${currency.symbol}${new Intl.NumberFormat(currency.locale).format(value)}`;
}
