"use client";

import Image from "next/image";
import { useCapabilities } from "@/lib/capabilities";

/**
 * High-quality stills of the camera film. Used when WebGL is unavailable or
 * the device is too weak, and as a stand-in while the 3D scene is loading.
 */
const POSTERS = [
  { src: "/media/hero-lens.webp", alt: "Extreme close-up of a black camera lens with a deep red point of light at its centre" },
  { src: "/media/hero-body.webp", alt: "A black camera revealed by a red rim light on a black mirror floor" },
  { src: "/media/hero-sos.webp", alt: "The letters S, O and S — the O formed by the camera lens — lit in deep red" },
];
const FRAME_TO_POSTER = [-1, 0, 1, 1, 1, 2];

export function HeroFallback({ frame, hidden }: { frame: number; hidden: boolean }) {
  const caps = useCapabilities();
  const noGL = caps.ready && caps.tier === "none";
  // 3D users only fetch a poster if the scene isn't ready by the time they need it.
  const needed = noGL || (caps.ready && !hidden && frame > 0);
  if (!needed) return null;

  const active = FRAME_TO_POSTER[frame];
  return (
    <div
      aria-hidden={!noGL}
      className="absolute inset-0 transition-opacity duration-1000"
      style={{ opacity: hidden ? 0 : 1 }}
    >
      {POSTERS.map((p, i) => (
        <Image
          key={p.src}
          src={p.src}
          alt={noGL ? p.alt : ""}
          fill
          sizes="100vw"
          className="object-cover transition-opacity duration-[900ms] ease-[var(--ease-film)]"
          style={{ opacity: active === i ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
