"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export type Tier = "high" | "mid" | "none";

export type Capabilities = {
  /** false until measured on the client */
  ready: boolean;
  tier: Tier;
  reducedMotion: boolean;
  touch: boolean;
};

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

let cachedTier: Tier | null = null;

/**
 * Decides how much 3D a device should get.
 *  high → full scene, reflections, depth of field, bloom
 *  mid  → simplified scene, no heavy post-processing
 *  none → no WebGL; show the high-quality still fallback
 * Override for testing with ?quality=high|mid|none
 */
export function detectTier(): Tier {
  if (cachedTier) return cachedTier;
  const q = new URLSearchParams(window.location.search).get("quality");
  if (q === "high" || q === "mid" || q === "none") return (cachedTier = q);

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return (cachedTier = "none");

  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  try {
    const canvas = document.createElement("canvas");
    gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
  } catch {
    gl = null;
  }
  if (!gl) return (cachedTier = "none");

  let renderer = "";
  try {
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (ext) renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
  } catch {
    /* ignore */
  }
  gl.getExtension("WEBGL_lose_context")?.loseContext();

  if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return (cachedTier = "none");

  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  if (cores <= 2 || memory <= 2) return (cachedTier = "none");

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  if (coarse || small || cores <= 4 || memory <= 4) return (cachedTier = "mid");

  return (cachedTier = "high");
}

export function useCapabilities(): Capabilities {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<{ ready: boolean; tier: Tier; touch: boolean }>({
    ready: false,
    tier: "mid",
    touch: false,
  });

  useEffect(() => {
    // Measured once on the client; the server render assumes nothing.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      ready: true,
      tier: detectTier(),
      touch: window.matchMedia("(pointer: coarse)").matches,
    });
  }, []);

  return { ...state, reducedMotion };
}
