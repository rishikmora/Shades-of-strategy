"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Media as MediaType } from "@/content/portfolio";
import { useReducedMotion } from "@/lib/capabilities";
import { GeneratedVisual } from "./GeneratedVisual";

type Props = {
  media: MediaType;
  /** load eagerly (first screen) */
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * One component for every kind of portfolio media:
 * responsive images (AVIF/WebP via next/image), muted cinematic video,
 * or the generated placeholder artwork.
 */
export function Media({ media, priority, sizes = "100vw", className = "" }: Props) {
  const reduced = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);

  // Videos only play while visible, and never when motion is reduced.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (reduced) {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => undefined);
        else v.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  if (media.type === "image") {
    return (
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes={sizes}
        preload={priority}
        className={`object-cover ${className}`}
      />
    );
  }

  if (media.type === "video") {
    return (
      <video
        ref={video}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
        src={media.src}
        poster={media.poster}
        muted
        loop
        playsInline
        preload={priority ? "auto" : "metadata"}
        aria-label={media.alt}
      />
    );
  }

  return <GeneratedVisual variant={media.variant} seed={media.seed} alt={media.alt} className={className} />;
}
