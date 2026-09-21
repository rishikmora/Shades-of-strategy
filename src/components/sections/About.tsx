"use client";

import { useRef } from "react";
import { siteConfig } from "@/content/siteConfig";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/capabilities";
import { rich } from "@/lib/richText";

const { about } = siteConfig;

/**
 * AN IDEA DESERVES A FORM.
 * The last line begins as an outline and becomes solid as you read.
 */
export function About() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const lines = gsap.utils.toArray<HTMLElement>("[data-line]", ref.current);
      if (reduced) {
        gsap.from(lines, { opacity: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: ref.current, start: "top 70%", once: true } });
        gsap.set("[data-form-fill]", { clipPath: "inset(0 0% 0 0)" });
        return;
      }
      gsap.fromTo(
        lines,
        { yPercent: 108 },
        {
          yPercent: 0,
          duration: 1.4,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ref.current, start: "top 70%", once: true },
        },
      );
      gsap.fromTo(
        "[data-form-fill]",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          ease: "none",
          scrollTrigger: { trigger: "[data-form-line]", start: "top 75%", end: "top 30%", scrub: 0.6 },
        },
      );
      gsap.fromTo(
        "[data-body]",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-body]", start: "top 85%", once: true },
        },
      );
    },
    { scope: ref, dependencies: [reduced] },
  );

  const last = about.lines.length - 1;

  return (
    <section ref={ref} id="about" aria-labelledby="about-title" className="gutter relative py-[20vh]">
      <p className="eyebrow mb-8">About</p>
      <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <h2 id="about-title" className="display t-xl">
          {about.lines.map((line, i) =>
            i === last ? (
              <span key={i} className="line-mask" data-form-line>
                <span data-line className="relative block">
                  <span className="outline-type">{rich(line)}</span>
                  <span data-form-fill aria-hidden className="absolute inset-0 text-bone">
                    {rich(line)}
                  </span>
                </span>
              </span>
            ) : (
              <span key={i} className="line-mask">
                <span data-line className="block">
                  {rich(line)}
                </span>
              </span>
            ),
          )}
        </h2>
        <p data-body className="max-w-[34ch] text-[clamp(1.15rem,1.6vw,1.45rem)] leading-[1.45] text-bone/75">
          {about.body}
        </p>
      </div>
    </section>
  );
}
