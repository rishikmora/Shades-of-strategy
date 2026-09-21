"use client";

import { useRef } from "react";
import { contact } from "@/content/contact";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/capabilities";
import { scrollToHash } from "@/lib/store";
import { RevealLines } from "@/components/ui/RevealLines";
import { ContactForm } from "./ContactForm";

/** The ending of the film: darkness, a red glow, and an invitation. */
export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-glow]",
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1,
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top 85%", end: "top 10%", scrub: reduced ? true : 1 },
        },
      );
      gsap.fromTo(
        "[data-close], [data-ctas]",
        { opacity: 0, y: reduced ? 0 : 24 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "expo.out",
          stagger: 0.15,
          scrollTrigger: { trigger: "[data-close]", start: "top 88%", once: true },
        },
      );
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section ref={ref} id="contact" aria-labelledby="contact-title" className="relative overflow-hidden">
      <div className="relative flex min-h-svh flex-col items-center justify-center py-[18vh] text-center">
        <div
          data-glow
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[-30%] mx-auto h-[90%] w-[120%] max-w-[1600px] opacity-0"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 60%, rgba(139,0,0,0.42) 0%, rgba(18,0,0,0.6) 45%, rgba(5,5,5,0) 75%)",
          }}
        />
        <div className="gutter relative">
          <RevealLines id="contact-title" lines={contact.headline} className="display t-xl" />
          <p data-close className="accent mt-[7vh] text-[clamp(1.6rem,3.2vw,3rem)] text-bone/90">
            {contact.close}
          </p>

          <div data-ctas className="mt-[7vh] flex flex-col items-center gap-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="#contact-form"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHash("#contact-form", { focus: "#contact-name" });
                }}
                className="group inline-flex items-center gap-4 rounded-full bg-bone py-4 pr-4 pl-7 text-void transition-transform duration-500 ease-[var(--ease-film)] hover:scale-[1.02]"
              >
                <span className="label">{contact.primaryCta}</span>
                <span
                  aria-hidden
                  className="grid h-8 w-8 place-items-center rounded-full bg-void text-bone transition-transform duration-500 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="label inline-flex items-center gap-3 rounded-full border border-bone/25 px-7 py-[1.3rem] text-bone transition-colors duration-500 hover:border-bone"
              >
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red" />
                {contact.secondaryCta}
              </a>
            </div>
            <a
              href={`mailto:${contact.email}`}
              className="text-[clamp(1.05rem,1.6vw,1.35rem)] text-bone/85 underline decoration-bone/25 underline-offset-[6px] transition-colors hover:decoration-bone"
            >
              {contact.email}
            </a>
          </div>
        </div>
      </div>

      <div className="gutter relative pb-[16vh]">
        <div className="grid gap-12 border-t border-line pt-14 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <h3 className="display t-md">{contact.form.title}</h3>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
