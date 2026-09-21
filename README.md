# Shades of Strategy — website

The official site for **Shades of Strategy (SOS)**, a creative + technology agency.
One continuous film: a cinematic 3D camera opening, editorial typography, and a
black / deep-red visual language.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, React Three Fiber,
Three.js, GSAP + ScrollTrigger and Lenis.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run lint
```

---

## Editing the site (no 3D knowledge needed)

Everything you'd normally change lives in **`src/content/`**. Edit the text between
the quotes, save, and the site updates. You never need to touch the animation code.

| What you want to change | File |
| --- | --- |
| Email address | `src/content/contact.ts` → `email` |
| Contact headline, button labels, form labels, "What do you need?" options | `src/content/contact.ts` |
| Prices, package names, what's included | `src/content/packages.ts` → `packages` |
| Optional add-ons and their prices | `src/content/packages.ts` → `addOns` |
| The negotiable-prices note | `src/content/packages.ts` → `packagesIntro.note` |
| Services (names, one-liners, order) | `src/content/services.ts` |
| Portfolio projects, images, videos | `src/content/portfolio.ts` |
| Every story line (hero film, statement, about, philosophy, ending), navigation, SEO title/description | `src/content/siteConfig.ts` |

**Accent words.** Wrap a word in `*asterisks*` to set it in the italic serif accent:
`"WITH A *POINT OF VIEW.*"`.

**Prices** are plain numbers: `price: 39999` shows as **₹39,999**.
Add `unit: "video"` to an add-on to show **₹1,999 / video**.

**Services.** Each service has a `visual` that picks its 3D object:
`photography`, `videography`, `editing`, `event`, `web`, `apps` or `motion`.

### Portfolio — replace the sample entries

⚠️ The six projects in `src/content/portfolio.ts` are **sample entries** with
generated placeholder artwork, so the layout can be seen. Replace them with real
work before launch.

1. Put your files in `public/`, e.g. `public/work/my-project/cover.jpg`.
2. Edit an entry (or copy one):

```ts
{
  slug: "my-project",                // page address: /work/my-project
  title: "My Project",
  category: "Photography",           // Photography | Videography | Video Editing | Web | Apps | Motion
  line: "One short sentence.",
  cover: { type: "image", src: "/work/my-project/cover.jpg", alt: "What the image shows" },
  gallery: [
    { type: "image", src: "/work/my-project/01.jpg", alt: "…" },
    { type: "video", src: "/work/my-project/film.mp4", poster: "/work/my-project/film.jpg", alt: "…" },
  ],
  created: ["Art direction", "Photography", "Retouching"],
}
```

- **Images**: upload large JPG/PNG (2400–3000px wide). They are converted to
  AVIF/WebP and resized for every screen automatically.
- **Videos**: MP4 (H.264), muted, 1920px wide, ideally under ~8 MB. Always add a
  `poster` image. Videos only play while on screen, and never for visitors who
  prefer reduced motion.
- **Alt text** is required: describe what the image shows.

---

## Contact form

The form works out of the box: without email configured, submitting opens the
visitor's email app with their message pre-filled to your address.

To receive enquiries directly in your inbox, create a free
[Resend](https://resend.com) account and set these environment variables
(see `.env.example`):

```
RESEND_API_KEY=re_...
CONTACT_FROM="Shades of Strategy <hello@yourdomain.com>"   # a sender verified in Resend
```

Enquiries are sent to the `email` in `src/content/contact.ts`.

## Site address (SEO)

Set `NEXT_PUBLIC_SITE_URL` to your real domain (e.g. `https://shadesofstrategy.com`)
so canonical links, the sitemap and social previews are correct. On Vercel the
production URL is picked up automatically if this isn't set.

---

## How the site is built

```
src/
  content/            ← all editable content (see above)
  app/                ← pages, SEO (metadata, sitemap, robots, OG image), contact API
  components/
    hero/             ← the opening camera film: shot list, scene, fallback
    three/            ← 3D: the procedural camera, materials, service objects
    sections/         ← each section of the page
    layout/           ← navigation, mobile menu, footer, sound toggle
    ui/               ← shared pieces (monogram, line reveals, media)
  lib/                ← GSAP setup, device capability detection, sound, stores
public/media/         ← rendered stills of the camera film (fallback + loading)
```

- **The camera is procedural.** It's modelled in code (turned lens rings, knurled
  dials, a working 9-blade iris, leatherette grain, engraved markings), so there is
  no model file to download and nothing to compress.
- **The opening film** is a shot list in `src/components/hero/shots.ts`: each
  keyframe sets the camera position, lens focus, aperture, lights and environment
  for a point in the scroll.
- **Three quality tiers**, chosen per device: `high` (reflections, depth of field,
  bloom), `mid` (phones and smaller GPUs: lighter scene, no post-processing) and
  `none` (no WebGL, very weak devices or data-saver: high-quality stills of the same
  film). Force one for testing with `?quality=high|mid|none`.
- **Render on demand.** The 3D only renders while something is changing, and
  pauses completely when off screen.
- **Reduced motion.** With the OS setting on, smooth scrolling is disabled, the
  camera cuts between still compositions instead of moving, and reveals become
  simple fades.
- **Sound** is optional, off by default, and synthesised in the browser (no audio
  files). Nothing plays until the visitor turns it on.
