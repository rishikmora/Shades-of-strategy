"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { services, servicesIntro } from "@/content/services";
import { contact } from "@/content/contact";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useCapabilities } from "@/lib/capabilities";
import { scrollToHash, selectedNeed } from "@/lib/store";
import { sound } from "@/lib/sound";
import { RevealLines } from "@/components/ui/RevealLines";

const ServicesCanvas = dynamic(() => import("@/components/three/services/ServicesCanvas"), { ssr: false });

/** Map a service to the closest option in the contact form. */
function needFor(name: string) {
  const n = name.toLowerCase();
  return contact.needs.find((o) => n.includes(o.toLowerCase()) || o.toLowerCase().includes(n)) ?? null;
}

export function Services() {
  const caps = useCapabilities();
  const section = useRef<HTMLElement>(null);
  const [scrollIdx, setScrollIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const active = hoverIdx ?? scrollIdx;
  const current = services[active];

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // a quiet shutter tick when the subject changes (only if sound is on)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    sound?.shutter();
  }, [active]);

  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-service]", section.current);
      rows.forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (self.isActive) setScrollIdx(i);
          },
        });
      });
      if (!caps.reducedMotion) {
        rows.forEach((row) => {
          gsap.fromTo(
            row.querySelectorAll("[data-rise]"),
            { yPercent: 40, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 1.3,
              ease: "expo.out",
              stagger: 0.08,
              scrollTrigger: { trigger: row, start: "top 85%", once: true },
            },
          );
        });
      }
    },
    { scope: section, dependencies: [caps.reducedMotion] },
  );

  const choose = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    const need = needFor(name);
    if (need) selectedNeed.set(need);
    scrollToHash("#contact-form", { focus: "#contact-name" });
  };

  const show3D = caps.ready && caps.tier !== "none";

  return (
    <section
      ref={section}
      id="services"
      aria-labelledby="services-title"
      className="relative pt-[18vh] pb-[12vh]"
    >
      <div className="gutter">
        <p className="eyebrow mb-8">{servicesIntro.eyebrow}</p>
        <RevealLines id="services-title" lines={servicesIntro.lines} className="display t-xl" />
      </div>

      <div className="relative mt-[12vh] lg:grid lg:grid-cols-[1.05fr_1fr]">
        {/* The stage: one object at a time, in the same light */}
        <div className="pointer-events-none sticky top-0 z-0 h-svh lg:self-start">
          <div className="absolute inset-0 opacity-45 lg:opacity-100">
            {show3D ? (
              <ServicesCanvas
                visual={current.visual}
                active={inView}
                tier={caps.tier as "high" | "mid"}
                reduced={caps.reducedMotion}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center" aria-hidden>
                <span className="display text-[40vw] text-bone/[0.04] lg:text-[22vw]">
                  {String(active + 1).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
          {/* caption */}
          <div className="gutter absolute bottom-10 left-0 hidden items-end gap-5 lg:flex" aria-hidden>
            <span className="mono text-bone/40">
              {String(active + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
            </span>
            <span className="label text-bone/70">{current.name}</span>
          </div>
        </div>

        {/* The list */}
        <ol className="relative z-10 -mt-[100svh] lg:mt-0" onMouseLeave={() => setHoverIdx(null)}>
          {services.map((s, i) => {
            const isActive = i === active;
            return (
              <li
                key={s.id}
                data-service
                className="gutter flex min-h-[62svh] flex-col justify-center lg:min-h-[48svh] lg:pl-0"
              >
                <a
                  href="#contact-form"
                  onMouseEnter={() => setHoverIdx(i)}
                  onFocus={() => setHoverIdx(i)}
                  onBlur={() => setHoverIdx(null)}
                  onClick={(e) => choose(e, s.name)}
                  aria-label={`${s.name} — ${s.line} Start a ${s.name.toLowerCase()} project`}
                  className="group block py-4"
                >
                  <span className="flex items-baseline gap-5">
                    <span
                      data-rise
                      className={`mono transition-colors duration-500 ${isActive ? "text-red" : "text-bone/35"}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="line-mask">
                      <span
                        data-rise
                        className={`display block text-[clamp(2.6rem,6.4vw,7.2rem)] transition-[color,opacity] duration-700 ease-[var(--ease-film)] ${
                          isActive ? "text-bone" : "text-bone/20"
                        }`}
                      >
                        {s.name}
                      </span>
                    </span>
                  </span>
                  <span
                    data-rise
                    className={`mt-4 flex items-center gap-4 pl-[calc(0.6875rem*2.4+1.25rem)] transition-opacity duration-700 ${
                      isActive ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    <span className="accent text-xl normal-case text-bone/85 md:text-2xl">
                      <span className="normal-case">{s.line}</span>
                    </span>
                    <span
                      aria-hidden
                      className="label translate-x-0 text-bone/0 transition-all duration-500 group-hover:translate-x-1 group-hover:text-bone/60 group-focus-visible:text-bone/60"
                    >
                      →
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
