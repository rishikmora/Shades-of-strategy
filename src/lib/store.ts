"use client";

import type Lenis from "lenis";

/**
 * Tiny mutable stores shared between DOM (GSAP) and WebGL (R3F) without
 * triggering React renders. Read inside useFrame / tickers.
 */

export const heroState = {
  /** 0 → 1 across the opening camera film */
  progress: 0,
  /** true once the WebGL scene has rendered its first frame */
  ready: false,
  /** ask the hero canvas for a new frame (it renders on demand) */
  invalidate: () => {},
};

export const scrollState = {
  lenis: null as Lenis | null,
  velocity: 0,
};

type Listener<T> = (value: T) => void;

function createSignal<T>(initial: T) {
  let value = initial;
  const listeners = new Set<Listener<T>>();
  return {
    get: () => value,
    set(next: T) {
      value = next;
      listeners.forEach((l) => l(next));
    },
    subscribe(l: Listener<T>) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

/** A package chosen from the Packages section, used to prefill the form. */
export const selectedPackage = createSignal<string | null>(null);

/** A service chosen from the Services section, used to prefill "What do you need?". */
export const selectedNeed = createSignal<string | null>(null);

/** Smoothly scroll to an in-page anchor, respecting Lenis when active. */
export function scrollToHash(hash: string, opts?: { focus?: string }) {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    if (opts?.focus) document.querySelector<HTMLElement>(opts.focus)?.focus({ preventScroll: true });
  };
  // Sections carry their own breathing room; anything else clears the nav.
  const offset = target.tagName === "SECTION" ? 0 : -110;
  if (scrollState.lenis) {
    scrollState.lenis.scrollTo(target, { duration: 1.6, offset, onComplete: done });
    window.setTimeout(done, 1700);
  } else {
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset });
    done();
  }
  if (history.replaceState) history.replaceState(null, "", hash);
}
