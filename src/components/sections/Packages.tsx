"use client";

import { useId, useRef, useState } from "react";
import { addOns, addOnsIntro, formatPrice, packages, packagesIntro } from "@/content/packages";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/capabilities";
import { scrollToHash, selectedPackage } from "@/lib/store";
import { RevealLines } from "@/components/ui/RevealLines";

/**
 * A small iris: the larger the scale, the wider the aperture.
 * 0 → stopped down, 1 → wide open.
 */
function Iris({ open, className = "" }: { open: number; className?: string }) {
  const R = 20;
  const a = 3.2 + open * 11.5;
  const blades = 7;
  const lines = Array.from({ length: blades }).map((_, i) => {
    const phi = (i / blades) * Math.PI * 2 + open * 0.5;
    const px = Math.cos(phi) * a;
    const py = Math.sin(phi) * a;
    const tx = -Math.sin(phi);
    const ty = Math.cos(phi);
    const L = Math.sqrt(Math.max(0, R * R - a * a));
    const f = (n: number) => Math.round(n * 100) / 100; // identical on server and client
    return { x1: f(px - tx * L * 0.15), y1: f(py - ty * L * 0.15), x2: f(px + tx * L), y2: f(py + ty * L) };
  });
  const poly = Array.from({ length: blades })
    .map((_, i) => {
      const phi = ((i + 0.5) / blades) * Math.PI * 2 + open * 0.5;
      const r = a / Math.cos(Math.PI / blades);
      return `${(Math.cos(phi) * r).toFixed(2)},${(Math.sin(phi) * r).toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox="-22 -22 44 44" className={className} aria-hidden>
      <circle r={R} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={0.6} />
      {lines.map((l, i) => (
        <line key={i} {...l} stroke="currentColor" strokeOpacity={0.35} strokeWidth={0.6} />
      ))}
      <polygon points={poly} fill="rgba(176,0,32,0.18)" stroke="#b00020" strokeWidth={0.7} />
    </svg>
  );
}

function AddOns() {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="mt-16 border-t border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between gap-6 py-7 text-left"
      >
        <span className="flex items-baseline gap-5">
          <span className="label text-bone">{addOnsIntro.title}</span>
          <span className="accent text-xl normal-case text-bone/60">{addOnsIntro.subtitle}</span>
        </span>
        <span
          aria-hidden
          className="relative grid h-10 w-10 place-items-center rounded-full border border-bone/20 transition-colors duration-500 group-hover:border-bone/60"
        >
          <span className="absolute h-px w-3.5 bg-bone" />
          <span
            className={`absolute h-3.5 w-px bg-bone transition-transform duration-500 ease-[var(--ease-film)] ${
              open ? "scale-y-0" : "scale-y-100"
            }`}
          />
        </span>
      </button>
      <div
        id={id}
        role="region"
        aria-label={`${addOnsIntro.title} ${addOnsIntro.subtitle}`}
        className="grid transition-[grid-template-rows] duration-700 ease-[var(--ease-film)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden" inert={!open}>
          <ul className="grid gap-x-16 pb-10 md:grid-cols-2">
            {addOns.map((a) => (
              <li key={a.name} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                <span className="text-bone/85">{a.name}</span>
                <span className="font-mono text-sm text-bone tabular-nums">
                  {formatPrice(a.price)}
                  {a.unit && <span className="text-bone/50"> / {a.unit}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Packages() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        "[data-panel]",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.4,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: "[data-panels]", start: "top 80%", once: true },
        },
      );
    },
    { scope: ref, dependencies: [reduced] },
  );

  const choose = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    selectedPackage.set(name);
    scrollToHash("#contact-form", { focus: "#contact-name" });
  };

  return (
    <section ref={ref} id="packages" aria-labelledby="packages-title" className="gutter relative py-[18vh]">
      <p className="eyebrow mb-8">{packagesIntro.eyebrow}</p>
      <RevealLines id="packages-title" lines={packagesIntro.lines} className="display t-xl" />

      <div
        data-panels
        className="-mx-[var(--gutter)] mt-[10vh] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-4"
        data-lenis-prevent-horizontal
        aria-label="Packages"
        role="list"
      >
        {packages.map((p, i) => (
          <article
            key={p.id}
            data-panel
            role="listitem"
            aria-labelledby={`pkg-${p.id}`}
            className="group relative flex min-h-[34rem] w-[82vw] shrink-0 snap-start flex-col overflow-hidden rounded-[2px] border border-line bg-[linear-gradient(180deg,#0c0c0c,#070707)] p-7 transition-[border-color,transform] duration-700 ease-[var(--ease-film)] hover:border-bone/25 md:w-auto md:p-8 xl:min-h-[40rem]"
          >
            {/* light spilling from above on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-1/3 h-2/3 opacity-0 transition-opacity duration-1000 group-hover:opacity-100"
              style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(176,0,32,0.28), transparent 70%)" }}
            />
            <div className="relative flex items-start justify-between">
              <span className="mono text-bone/45">{String(i + 1).padStart(2, "0")}</span>
              <Iris
                open={i / (packages.length - 1)}
                className="h-11 w-11 text-bone transition-transform duration-1000 ease-[var(--ease-film)] group-hover:rotate-[30deg]"
              />
            </div>

            <h3 id={`pkg-${p.id}`} className="display relative mt-14 text-[clamp(2rem,2.9vw,2.9rem)] leading-[0.9]">
              {p.name}
            </h3>
            <p className="relative mt-4 font-sans text-xl tabular-nums text-bone/90">{formatPrice(p.price)}</p>

            <span className="hairline relative mt-8 block" aria-hidden />
            <ul className="relative mt-6 flex-1 space-y-2.5 text-[0.95rem] text-bone/70">
              {p.includes.map((item) => (
                <li key={item} className="flex items-baseline gap-3">
                  <span aria-hidden className="h-px w-3 shrink-0 translate-y-[-0.3em] bg-bone/30" />
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="#contact-form"
              onClick={(e) => choose(e, p.name)}
              className="label relative mt-10 flex items-center justify-between border-t border-line pt-6 text-bone/80 transition-colors hover:text-bone"
            >
              {packagesIntro.cta} {p.name}
              <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </a>
          </article>
        ))}
      </div>

      <p className="mt-10 max-w-xl text-[0.95rem] font-semibold text-bone">{packagesIntro.note}</p>

      <AddOns />
    </section>
  );
}
