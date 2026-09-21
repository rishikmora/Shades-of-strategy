"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/content/siteConfig";
import { useCapabilities } from "@/lib/capabilities";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { heroState } from "@/lib/store";
import { rich, plain } from "@/lib/richText";
import { frameWindows } from "./shots";
import { HeroFallback } from "./HeroFallback";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

/** Still progress used per frame when motion is reduced (cuts, not moves). */
const REDUCED_STILLS = [0.27, 0.27, 0.42, 0.56, 0.74, 1];

const frames = siteConfig.hero.frames;

export function Hero() {
  const caps = useCapabilities();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState(false);
  const [frame, setFrame] = useState(0);
  const [stillIdx, setStillIdx] = useState(0);
  const [cutting, setCutting] = useState(false);

  const use3D = caps.ready && caps.tier !== "none";
  const reduced = caps.reducedMotion;

  // Pause WebGL when the film is off screen.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) requestAnimationFrame(() => heroState.invalidate());
      },
      { rootMargin: "10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Reveal the canvas once it has actually drawn (never a blank frame).
  useEffect(() => {
    if (!use3D || ready) return;
    let raf = 0;
    const check = () => {
      if (heroState.ready) setReady(true);
      else raf = requestAnimationFrame(check);
    };
    raf = requestAnimationFrame(check);
    return () => cancelAnimationFrame(raf);
  }, [use3D, ready]);

  // Reduced motion: cut between still compositions with a short fade to black.
  useEffect(() => {
    if (!reduced) return;
    const next = REDUCED_STILLS[frame];
    if (next === REDUCED_STILLS[stillIdx]) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCutting(true);
    const t = window.setTimeout(() => {
      setStillIdx(frame);
      window.setTimeout(() => setCutting(false), 120);
    }, 320);
    return () => window.clearTimeout(t);
  }, [frame, reduced, stillIdx]);

  useGSAP(
    () => {
      const el = section.current;
      if (!el) return;

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate(self) {
          heroState.progress = self.progress;
          heroState.invalidate();
          let f = 0;
          frameWindows.forEach((w, i) => {
            if (self.progress >= w.in[0] - 0.005) f = i;
          });
          setFrame((prev) => (prev === f ? prev : f));
        },
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: true },
      });
      tl.set({}, {}, 1); // timeline length = scroll progress 0 → 1

      const blur = reduced ? "blur(0px)" : "blur(14px)";
      el.querySelectorAll<HTMLElement>("[data-frame]").forEach((node, i) => {
        const lines = node.querySelectorAll("[data-line]");
        const w = frameWindows[i];
        if (i > 0) {
          tl.fromTo(
            lines,
            { y: reduced ? 0 : 28, opacity: 0, filter: blur },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              ease: "power2.out",
              duration: w.in[1] - w.in[0],
              stagger: 0.008,
            },
            w.in[0],
          );
        }
        if (w.out) {
          tl.to(
            lines,
            {
              y: reduced ? 0 : -22,
              opacity: 0,
              filter: blur,
              ease: "power2.in",
              duration: w.out[1] - w.out[0],
              stagger: 0.006,
            },
            w.out[0],
          );
        }
      });

      // scroll hint and the first red line
      tl.to("[data-hint]", { opacity: 0, duration: 0.03 }, 0.005);
      tl.to("[data-redline]", { scaleX: 3.2, opacity: 0, duration: 0.05, ease: "power2.in" }, 0.075);

      // Intro (time-based, never blocks): the name, then a line of red light
      if (!reduced) {
        gsap.fromTo(
          "[data-intro]",
          { opacity: 0, letterSpacing: "0.9em" },
          { opacity: 1, letterSpacing: "0.52em", duration: 2.4, ease: "power2.out", delay: 0.2 },
        );
        gsap.fromTo(
          "[data-redline-inner]",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.8, ease: "expo.inOut", delay: 1.1 },
        );
      }
    },
    { scope: section, dependencies: [reduced] },
  );

  const still = reduced ? REDUCED_STILLS[stillIdx] : undefined;

  return (
    <section
      ref={section}
      id="top"
      aria-label="Shades of Strategy — opening film"
      className="relative h-[620vh] md:h-[720vh]"
    >
      <a
        href="#statement"
        className="sr-only-focusable absolute top-20 left-[var(--gutter)] z-30 label bg-void px-4 py-3"
      >
        Skip intro
      </a>

      <div ref={stage} className="sticky top-0 h-svh w-full overflow-hidden bg-void">
        {/* Poster / fallback: always painted first, so the screen is never blank */}
        <HeroFallback frame={frame} hidden={use3D && ready} />

        {use3D && (
          <div
            className="absolute inset-0 transition-opacity duration-[1600ms] ease-[var(--ease-film)]"
            style={{ opacity: ready && !cutting ? 1 : 0, transitionDuration: cutting ? "320ms" : undefined }}
          >
            <HeroCanvas tier={caps.tier as "high" | "mid"} active={inView} still={still} />
          </div>
        )}

        {/* Cinematic vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 85%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        {/* ---------------- Frames ---------------- */}
        <div className="pointer-events-none absolute inset-0">
          {/* 01 */}
          <div data-frame className="gutter absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-center">
              <span data-line className="block">
                <span
                  data-intro
                  className="block pl-[0.52em] text-[0.7rem] font-medium tracking-[0.52em] text-bone/90 md:text-[0.8rem]"
                >
                  {plain(frames[0].lines[0])}
                </span>
              </span>
              <span className="sr-only"> — Creative and technology agency</span>
            </h1>
            <span data-redline className="mt-7 block h-px w-28 origin-center" aria-hidden>
              <span
                data-redline-inner
                className="block h-px w-full origin-center bg-red"
                style={{ boxShadow: "0 0 12px 1px rgba(176,0,32,0.9), 0 0 36px 4px rgba(176,0,32,0.35)" }}
              />
            </span>
          </div>

          {/* 02 — centred, over the lens */}
          <div data-frame className="gutter absolute inset-0 flex items-center justify-center text-center">
            <p className="display t-hero">
              {frames[1].lines.map((l, i) => (
                <span key={i} className="block">
                  <span data-line className="block opacity-0">
                    {rich(l)}
                  </span>
                </span>
              ))}
            </p>
          </div>

          {/* 03 — left */}
          <div data-frame className="gutter absolute inset-0 flex items-end pb-[18vh] md:items-center md:pb-0">
            <p className="display t-xl max-w-[12ch]">
              {frames[2].lines.map((l, i) => (
                <span key={i} className="block">
                  <span data-line className="block opacity-0">
                    {rich(l)}
                  </span>
                </span>
              ))}
            </p>
          </div>

          {/* 04 — right */}
          <div
            data-frame
            className="gutter absolute inset-0 flex items-end justify-end pb-[18vh] text-right md:items-center md:pb-0"
          >
            <p className="display t-xl">
              {frames[3].lines.map((l, i) => (
                <span key={i} className="block">
                  <span data-line className="block opacity-0">
                    {rich(l)}
                  </span>
                </span>
              ))}
            </p>
          </div>

          {/* 05 — left */}
          <div data-frame className="gutter absolute inset-0 flex items-end pb-[16vh] md:items-center md:pb-0">
            <p className="display t-xl">
              {frames[4].lines.map((l, i) => (
                <span key={i} className="block">
                  <span data-line className="block opacity-0">
                    {rich(l)}
                  </span>
                </span>
              ))}
            </p>
          </div>

          {/* 06 — the name */}
          <div
            data-frame
            className="gutter absolute inset-x-0 bottom-[13vh] flex flex-col items-center text-center md:bottom-[11vh]"
          >
            <p className="display text-[clamp(2rem,6.4vw,6.2rem)] tracking-[-0.02em]">
              <span className="block">
                <span data-line className="block opacity-0">
                  {rich(frames[5].lines[0])}
                </span>
              </span>
            </p>
            <p className="mt-5 overflow-hidden">
              <span data-line className="eyebrow block pl-[0.32em] text-bone/80 opacity-0">
                {frames[5].sub}
              </span>
            </p>
          </div>
        </div>

        {/* ---------------- Viewfinder ---------------- */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
          {[
            "left-6 top-24 border-l border-t",
            "right-6 top-24 border-r border-t",
            "left-6 bottom-6 border-l border-b",
            "right-6 bottom-6 border-r border-b",
          ].map((c) => (
            <span key={c} className={`absolute h-4 w-4 border-bone/30 ${c}`} />
          ))}
          <div className="mono absolute bottom-7 left-12 flex gap-4 text-bone/45">
            <span id="hud-fstop">f/1.2</span>
            <span>1/50</span>
            <span>ISO 100</span>
          </div>
        </div>
        <div aria-hidden className="mono pointer-events-none absolute right-6 bottom-24 text-bone/45 md:right-12 md:bottom-7">
          <span className="text-bone/80">{String(frame + 1).padStart(2, "0")}</span>
          <span className="mx-2">/</span>
          {String(frames.length).padStart(2, "0")}
        </div>

        <div
          data-hint
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-24 flex flex-col items-center gap-3 md:bottom-10"
        >
          <span className="label text-bone/50">{siteConfig.hero.scrollHint}</span>
          <span className="relative block h-10 w-px overflow-hidden bg-bone/10">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[hint_2.4s_var(--ease-lens)_infinite] bg-bone/70 motion-reduce:animate-none" />
          </span>
        </div>
      </div>
    </section>
  );
}
