"use client";

import Link from "next/link";
import { useRef } from "react";
import { portfolioIntro, projects } from "@/content/portfolio";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/capabilities";
import { RevealLines } from "@/components/ui/RevealLines";
import { Media } from "@/components/ui/Media";

const categories = Array.from(new Set(projects.map((p) => p.category)));

/**
 * WHAT WE CREATE. — one project at a time, full screen.
 * Each new project slides over the last, which sinks into the dark.
 */
export function Portfolio() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const list = ref.current?.querySelector<HTMLElement>("[data-list]");
      if (!list) return;
      const panels = gsap.utils.toArray<HTMLElement>("[data-project]", list);
      const n = panels.length;
      const parts = panels.map((panel) => ({
        inner: panel.querySelector<HTMLElement>("[data-inner]"),
        media: panel.querySelector<HTMLElement>("[data-media]"),
        shade: panel.querySelector<HTMLElement>("[data-shade]"),
        copy: panel.querySelectorAll<HTMLElement>("[data-copy]"),
        shown: false,
      }));
      parts.forEach((p) => gsap.set(p.copy, reduced ? { opacity: 0 } : { yPercent: 105 }));

      // One trigger for the whole reel. s = how many screens have scrolled in.
      ScrollTrigger.create({
        trigger: list,
        start: "top bottom",
        end: "bottom bottom",
        onUpdate(self) {
          const s = self.progress * n;
          parts.forEach((p, i) => {
            const enter = s - i; // 0 → 1 while this panel rises into place
            const leave = Math.min(1, Math.max(0, s - (i + 1))); // next one covering it
            if (p.inner) p.inner.style.transform = reduced ? "" : `scale(${1 - leave * 0.08})`;
            if (p.shade) p.shade.style.opacity = String(leave * 0.85);
            if (p.media && !reduced) {
              const k = Math.min(2, Math.max(0, enter));
              p.media.style.transform = `translateY(${(k - 1) * -5}%) scale(${1.08 - Math.min(1, k) * 0.08})`;
            }
            if (!p.shown && enter > 0.6) {
              p.shown = true;
              gsap.to(p.copy, {
                yPercent: 0,
                opacity: 1,
                duration: reduced ? 0.8 : 1.3,
                ease: "expo.out",
                stagger: 0.08,
              });
            }
          });
        },
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section ref={ref} id="work" aria-labelledby="work-title" className="relative pt-[18vh]">
      <div className="gutter mb-[12vh] flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-8">{portfolioIntro.eyebrow}</p>
          <RevealLines id="work-title" lines={portfolioIntro.lines} className="display t-xl" />
        </div>
        <ul className="flex max-w-md flex-wrap gap-x-5 gap-y-2 md:justify-end" aria-label="Disciplines">
          {categories.map((c) => (
            <li key={c} className="label text-bone/50">
              {c}
            </li>
          ))}
        </ul>
      </div>

      <ol data-list>
        {projects.map((p, i) => (
          <li key={p.slug} data-project className="sticky top-0 h-svh">
            <div className="h-svh overflow-hidden">
              <div data-inner className="relative h-full w-full origin-top overflow-hidden bg-ink">
                <div data-media className="absolute inset-0">
                  <Media media={p.cover} sizes="100vw" />
                </div>
                {/* red / black grade */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0) 30%, rgba(5,5,5,0) 55%, rgba(5,5,5,0.92) 100%), linear-gradient(90deg, rgba(18,0,0,0.55), rgba(18,0,0,0) 60%)",
                  }}
                />
                <div data-shade aria-hidden className="absolute inset-0 bg-void opacity-0" />

                <div className="gutter absolute inset-x-0 top-[calc(var(--nav-h)+1.5rem)] flex justify-between">
                  <span className="mono overflow-hidden text-bone/60">
                    <span data-copy className="block">
                      {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="label overflow-hidden text-bone/80">
                    <span data-copy className="block">
                      {p.category}
                    </span>
                  </span>
                </div>

                <div className="gutter absolute inset-x-0 bottom-[12vh] flex flex-col gap-8 md:bottom-[9vh] md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="display t-xl">
                      <span className="line-mask">
                        <span data-copy className="block">
                          {p.title}
                        </span>
                      </span>
                    </h3>
                    <p className="mt-5 overflow-hidden">
                      <span data-copy className="accent block text-xl normal-case text-bone/80 md:text-2xl">
                        {p.line}
                      </span>
                    </p>
                  </div>
                  <span className="overflow-hidden">
                    <Link
                      data-copy
                      href={`/work/${p.slug}`}
                      className="group label inline-flex items-center gap-4 rounded-full border border-bone/25 px-6 py-4 text-bone backdrop-blur-sm transition-colors duration-500 hover:border-bone hover:bg-bone hover:text-void"
                      aria-label={`${portfolioIntro.open}: ${p.title}`}
                    >
                      {portfolioIntro.open}
                      <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
