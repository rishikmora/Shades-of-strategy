"use client";

import { useRef } from "react";
import { siteConfig } from "@/content/siteConfig";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/capabilities";
import { RevealLines } from "@/components/ui/RevealLines";

const { statement } = siteConfig;

/** WHERE IDEAS FIND THEIR IDENTITY. — the first thing said out loud. */
export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        "[data-rule]",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "expo.inOut",
          duration: 1.8,
          scrollTrigger: { trigger: "[data-rule]", start: "top 90%", once: true },
        },
      );
      gsap.fromTo(
        "[data-sign]",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "expo.out",
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-rule]", start: "top 90%", once: true },
        },
      );
      // slow drift, as if the camera were still moving
      gsap.to("[data-drift]", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section
      ref={ref}
      id="statement"
      aria-labelledby="statement-title"
      className="gutter relative flex min-h-svh flex-col justify-center py-[18vh]"
    >
      <div data-drift>
        <RevealLines id="statement-title" lines={statement.lines} className="display t-xl max-w-[14ch]" />
      </div>

      <div className="mt-[12vh] flex flex-col gap-6 md:mt-[16vh] md:ml-[42%] md:max-w-md">
        <span data-rule className="hairline block w-full origin-left" aria-hidden />
        <div className="flex items-baseline justify-between gap-6">
          <p data-sign className="label text-bone">
            {statement.name}
          </p>
          <p data-sign className="accent text-lg normal-case text-bone/70 md:text-xl">
            <span className="normal-case">{statement.sub}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
