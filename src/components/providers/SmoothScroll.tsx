"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/capabilities";
import { scrollState } from "@/lib/store";

/**
 * Lenis drives the page; GSAP's ticker drives Lenis, so ScrollTrigger and
 * smooth scrolling share one clock. Reduced motion → native scrolling.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }
    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.35,
      anchors: { duration: 1.6 },
    });
    scrollState.lenis = lenis;
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }
    lenis.on("scroll", (e: Lenis) => {
      scrollState.velocity = e.velocity;
      ScrollTrigger.update();
    });
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      scrollState.lenis = null;
    };
  }, [reduced]);

  // New page → start at the top, then re-measure every trigger.
  useEffect(() => {
    if (!window.location.hash) scrollState.lenis?.scrollTo(0, { immediate: true });
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60);
    return () => window.clearTimeout(id);
  }, [pathname]);

  // Fonts change line lengths; re-measure once they arrive.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return <>{children}</>;
}
