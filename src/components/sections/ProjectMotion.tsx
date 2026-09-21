"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/capabilities";

/**
 * Motion for a project story: the title rises, each full-screen visual
 * opens like a shutter, the list arrives line by line.
 */
export function ProjectMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.fromTo(
        el.querySelectorAll("[data-rise]"),
        reduced ? { opacity: 0 } : { yPercent: 105 },
        { yPercent: 0, opacity: 1, duration: 1.5, ease: "expo.out", stagger: 0.1, delay: 0.15 },
      );
      el.querySelectorAll<HTMLElement>("[data-shutter]").forEach((frame) => {
        if (reduced) {
          gsap.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.8, scrollTrigger: { trigger: frame, start: "top 80%", once: true } });
          return;
        }
        gsap.fromTo(
          frame,
          { clipPath: "inset(18% 12% 18% 12%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: { trigger: frame, start: "top 95%", end: "top 25%", scrub: 0.6 },
          },
        );
        const media = frame.querySelector("[data-parallax]");
        if (media) {
          gsap.fromTo(
            media,
            { scale: 1.15 },
            { scale: 1, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } },
          );
        }
      });
      el.querySelectorAll<HTMLElement>("[data-list]").forEach((list) => {
        gsap.fromTo(
          list.querySelectorAll("[data-item]"),
          reduced ? { opacity: 0 } : { yPercent: 105 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.3,
            ease: "expo.out",
            stagger: 0.08,
            scrollTrigger: { trigger: list, start: "top 80%", once: true },
          },
        );
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return <div ref={ref}>{children}</div>;
}
