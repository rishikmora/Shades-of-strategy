"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/content/siteConfig";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/capabilities";
import { rich } from "@/lib/richText";
import { SOSMark } from "@/components/ui/SOSMark";

const { ending } = siteConfig;

/**
 * After the credits: a long silence, then one last line, the mark,
 * and the screen goes to black.
 */
export function Ending() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: reduced ? true : 1.2,
          onUpdate(self) {
            const fade = self.progress > 0.9 ? "1" : "";
            if (document.documentElement.dataset.fade !== fade) document.documentElement.dataset.fade = fade;
          },
          onLeaveBack() {
            document.documentElement.dataset.fade = "";
          },
        },
      });
      tl.set({}, {}, 1);
      const blur = reduced ? "blur(0px)" : "blur(16px)";
      gsap.utils.toArray<HTMLElement>("[data-l]", el).forEach((l, i) => {
        tl.fromTo(
          l,
          { opacity: 0, filter: blur, y: reduced ? 0 : 20 },
          { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.14, ease: "power1.out" },
          0.08 + i * 0.12,
        );
      });
      tl.fromTo("[data-n]", { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.5);
      tl.fromTo(
        "[data-mark]",
        { opacity: 0, scale: reduced ? 1 : 0.96 },
        { opacity: 1, scale: 1, duration: 0.14, ease: "power1.out" },
        0.6,
      );
      tl.fromTo("[data-dot]", { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.72);
      // then, black
      tl.to("[data-black]", { opacity: 1, duration: 0.14 }, 0.84);
    },
    { scope: ref, dependencies: [reduced] },
  );

  useEffect(() => () => void (document.documentElement.dataset.fade = ""), []);

  return (
    <section ref={ref} id="ending" aria-label="Closing" className="relative h-[300vh] pt-[40vh]">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden text-center">
        <p className="display t-lg">
          {ending.lines.map((line, i) => (
            <span key={i} data-l className="block opacity-0">
              {rich(line)}
            </span>
          ))}
        </p>
        <p data-n className="label mt-[8vh] pl-[0.22em] text-bone/70 opacity-0">
          {ending.name}
        </p>
        <div data-mark className="relative mt-8 opacity-0">
          <SOSMark className="h-6 w-auto text-bone md:h-8" dot={false} title={siteConfig.name} />
          <span
            data-dot
            aria-hidden
            className="absolute top-1/2 left-1/2 h-[0.3rem] w-[0.3rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red opacity-0 md:h-[0.42rem] md:w-[0.42rem]"
            style={{ boxShadow: "0 0 14px 3px rgba(176,0,32,0.8)" }}
          />
        </div>
        <div data-black aria-hidden className="pointer-events-none absolute inset-0 bg-[#000] opacity-0" />
      </div>
    </section>
  );
}
