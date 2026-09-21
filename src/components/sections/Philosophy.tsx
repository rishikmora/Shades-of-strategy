"use client";

import { useRef } from "react";
import { siteConfig } from "@/content/siteConfig";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/capabilities";
import { rich } from "@/lib/richText";

const { philosophy } = siteConfig;

/**
 * THE WORLD REMEMBERS WHAT FEELS REAL.
 * Darkness, and one slow sweep of red light across it.
 */
export function Philosophy() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const lines = gsap.utils.toArray<HTMLElement>("[data-q]", el);
      const answer = gsap.utils.toArray<HTMLElement>("[data-a]", el);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: reduced ? true : 0.8 },
      });
      tl.set({}, {}, 1);

      // the light sweep: slow, left to right, the whole length of the scene
      if (!reduced) {
        tl.fromTo("[data-sweep]", { xPercent: -130 }, { xPercent: 130, duration: 1 }, 0);
        tl.fromTo("[data-beam]", { xPercent: -120, opacity: 0 }, { xPercent: 120, opacity: 1, duration: 0.5, ease: "power1.inOut" }, 0.05);
        tl.to("[data-beam]", { opacity: 0, duration: 0.15 }, 0.5);
      } else {
        tl.set("[data-sweep]", { xPercent: 0 }, 0);
      }

      lines.forEach((l, i) => {
        tl.fromTo(
          l,
          reduced ? { opacity: 0 } : { opacity: 0, yPercent: 40, filter: "blur(12px)" },
          { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 0.09, ease: "power2.out" },
          0.06 + i * 0.07,
        );
      });
      tl.to(lines, reduced ? { opacity: 0, duration: 0.08 } : { opacity: 0, yPercent: -30, filter: "blur(10px)", duration: 0.08, stagger: 0.012 }, 0.55);
      answer.forEach((a, i) => {
        tl.fromTo(
          a,
          reduced ? { opacity: 0 } : { opacity: 0, yPercent: 40, filter: "blur(12px)" },
          { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 0.1, ease: "power2.out" },
          0.62 + i * 0.08,
        );
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section ref={ref} aria-labelledby="philosophy-title" className="relative h-[300vh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        {/* the slow red light sweep */}
        <div
          data-sweep
          aria-hidden
          className="pointer-events-none absolute top-[-20%] left-1/2 h-[140%] w-[80vw] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(176,0,32,0.34) 0%, rgba(139,0,0,0.16) 38%, rgba(18,0,0,0.0) 72%)",
            filter: "blur(20px)",
          }}
        />
        <div
          data-beam
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 opacity-0"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(255,60,80,0.7) 50%, transparent)",
            boxShadow: "0 0 40px 6px rgba(176,0,32,0.35)",
          }}
        />

        <div className="gutter relative grid w-full">
          <h2 id="philosophy-title" className="display t-hero [grid-area:1/1]">
            {philosophy.lines.map((line, i) => (
              <span key={i} data-q className="block">
                {rich(line)}
              </span>
            ))}
          </h2>
          <p className="display t-xl self-center text-right [grid-area:1/1]">
            {philosophy.answer.map((line, i) => (
              <span key={i} data-a className="block opacity-0">
                {rich(line)}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
