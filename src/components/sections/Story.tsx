"use client";

import { useRef } from "react";
import { siteConfig } from "@/content/siteConfig";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/capabilities";

const words = siteConfig.story;

/**
 * IDEA → DIRECTION → IDENTITY → EXPERIENCE
 * One word at a time. The idea starts as an outline and gains a form;
 * red arrives progressively until the experience glows.
 */
export function Story() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-word]", el);
      const arrows = gsap.utils.toArray<HTMLElement>("[data-arrow]", el);
      const ticks = gsap.utils.toArray<HTMLElement>("[data-tick]", el);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: reduced ? true : 0.6 },
      });
      tl.set({}, {}, 1);

      const seg = 1 / words.length;
      items.forEach((item, i) => {
        const inner = item.querySelector("[data-inner]");
        const t0 = i * seg;
        if (i > 0) {
          tl.fromTo(
            inner,
            reduced ? { opacity: 0 } : { yPercent: 100, opacity: 1 },
            { yPercent: 0, opacity: 1, duration: seg * 0.28, ease: "power3.out" },
            t0 + seg * 0.02,
          );
          tl.fromTo(ticks[i], { opacity: 0.25 }, { opacity: 1, duration: seg * 0.1 }, t0);
        }
        if (i < items.length - 1) {
          tl.to(
            inner,
            reduced ? { opacity: 0, duration: seg * 0.2 } : { yPercent: -100, duration: seg * 0.28, ease: "power3.in" },
            t0 + seg * 0.62,
          );
          tl.to(ticks[i], { opacity: 0.25, duration: seg * 0.1 }, t0 + seg * 0.9);
          // the arrow: a line of light travelling down to the next word
          const a = arrows[i];
          tl.fromTo(a, { scaleY: 0, transformOrigin: "top" }, { scaleY: 1, duration: seg * 0.22 }, t0 + seg * 0.5);
          tl.to(a, { scaleY: 0, transformOrigin: "bottom", duration: seg * 0.2 }, t0 + seg * 0.8);
        }
      });

      // red arrives progressively
      tl.fromTo("[data-glow]", { opacity: 0 }, { opacity: 0.28, duration: seg * 2 }, seg * 1);
      tl.to("[data-glow]", { opacity: 1, scale: 1.15, duration: seg * 0.8, ease: "power2.out" }, seg * 3);
      tl.fromTo("[data-direction-line]", { scaleX: 0 }, { scaleX: 1, duration: seg * 0.4, ease: "power2.out" }, seg * 1.1);
      tl.fromTo("[data-fill]", { opacity: 0 }, { opacity: 1, duration: seg * 0.4 }, seg * 1.15);
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section ref={ref} aria-labelledby="story-title" className="relative h-[440vh]">
      <h2 id="story-title" className="sr-only">
        From idea to experience
      </h2>
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* the controlled deep-red glow of the experience */}
        <div
          data-glow
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 58%, rgba(139,0,0,0.55) 0%, rgba(18,0,0,0.9) 45%, rgba(5,5,5,0) 80%)",
          }}
        />

        {/* index */}
        <div className="gutter absolute inset-x-0 top-[calc(var(--nav-h)+2rem)] flex justify-between">
          <span className="eyebrow">The SOS story</span>
          <ol className="flex gap-4 md:gap-6" aria-hidden>
            {words.map((w, i) => (
              <li key={w} data-tick className="mono text-bone" style={{ opacity: i === 0 ? 1 : 0.25 }}>
                {String(i + 1).padStart(2, "0")}
              </li>
            ))}
          </ol>
        </div>

        <ol className="absolute inset-0">
          {words.map((word, i) => (
            <li key={word} data-word className="absolute inset-0 flex items-center justify-center">
              <span className="line-mask-y">
                <span
                  data-inner
                  className={`display relative block text-[clamp(3.4rem,15.2vw,17.5rem)] leading-[0.82] ${i > 0 ? "opacity-0" : ""}`}
                >
                  {i === 0 && <span className="outline-type">{word}</span>}
                  {i === 1 && (
                    <span className="relative inline-block">
                      <span className="outline-type">{word}</span>
                      <span data-fill className="absolute inset-0 text-bone opacity-0" style={{ clipPath: "inset(0 50% 0 0)" }} aria-hidden>
                        {word}
                      </span>
                      <span
                        data-direction-line
                        aria-hidden
                        className="absolute top-1/2 -right-[4vw] -left-[4vw] h-[2px] origin-left bg-red"
                        style={{ boxShadow: "0 0 18px rgba(176,0,32,0.8)" }}
                      />
                    </span>
                  )}
                  {i === 2 && (
                    <span className="text-bone">
                      {word}
                      <span className="text-red">.</span>
                    </span>
                  )}
                  {i === 3 && (
                    <span className="text-bone">{word}</span>
                  )}
                </span>
              </span>
            </li>
          ))}
        </ol>

        {/* the arrows between words — lines of light */}
        {words.slice(0, -1).map((_, i) => (
          <span
            key={i}
            data-arrow
            aria-hidden
            className="absolute left-1/2 top-[calc(50%+min(8vw,9rem))] h-[22vh] w-px -translate-x-1/2 scale-y-0"
            style={{
              background: `linear-gradient(to bottom, ${i === 0 ? "rgba(245,245,245,0.8)" : i === 1 ? "rgba(245,120,130,0.9)" : "#b00020"}, transparent)`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
