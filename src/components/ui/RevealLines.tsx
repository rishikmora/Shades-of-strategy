"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/capabilities";
import { rich } from "@/lib/richText";

type Props = {
  lines: readonly string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  lineClassName?: string;
  id?: string;
  /** scroll position that starts the reveal */
  start?: string;
  delay?: number;
  stagger?: number;
};

/**
 * Editorial line-by-line reveal. Each line rises out of its own mask once,
 * when it reaches the viewport. Reduced motion: a simple fade.
 */
export function RevealLines({
  lines,
  as: Tag = "h2",
  className = "",
  lineClassName = "",
  id,
  start = "top 82%",
  delay = 0,
  stagger = 0.09,
}: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets = el.querySelectorAll("[data-line]");
      gsap.fromTo(
        targets,
        reduced ? { opacity: 0 } : { yPercent: 108, opacity: 1 },
        {
          yPercent: 0,
          opacity: 1,
          duration: reduced ? 0.8 : 1.4,
          ease: "expo.out",
          stagger,
          delay,
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="line-mask">
          <span data-line className={`block ${lineClassName}`}>
            {rich(line)}
          </span>
        </span>
      ))}
    </Tag>
  );
}
