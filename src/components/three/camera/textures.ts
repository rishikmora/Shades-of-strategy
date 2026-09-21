"use client";

import * as THREE from "three";
import { MARK, sPath } from "@/lib/monogram";

/**
 * Procedural textures, generated once on the client. No image downloads:
 * leatherette grain, paint micro-texture, lens engravings, dial markings.
 */

const cache = new Map<string, THREE.Texture>();

function memo<T extends THREE.Texture>(key: string, make: () => T): T {
  const hit = cache.get(key);
  if (hit) return hit as T;
  const tex = make();
  cache.set(key, tex);
  return tex;
}

function canvas(w: number, h = w) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  return { c, ctx };
}

/** Font family registered by next/font, readable from CSS variables. */
export function cssFont(variable: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

// ---------------------------------------------------------------------------
// Height fields → normal maps
// ---------------------------------------------------------------------------

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function heightToNormal(height: Float32Array, size: number, strength: number) {
  const { c, ctx } = canvas(size);
  const img = ctx.createImageData(size, size);
  const at = (x: number, y: number) => height[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Pebbled leatherette: tileable Worley cells with soft domes. */
export function leatherNormal(size = 512) {
  return memo(`leather-${size}`, () => {
    const cells = 44;
    const rand = mulberry(7);
    const pts: [number, number][] = [];
    for (let i = 0; i < cells * cells; i++) pts.push([rand(), rand()]);
    const h = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * cells;
        const fy = (y / size) * cells;
        const cx = Math.floor(fx);
        const cy = Math.floor(fy);
        let d1 = 9;
        let d2 = 9;
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            const gx = (cx + ox + cells) % cells;
            const gy = (cy + oy + cells) % cells;
            const p = pts[gy * cells + gx];
            const px = cx + ox + p[0];
            const py = cy + oy + p[1];
            const d = Math.hypot(px - fx, py - fy);
            if (d < d1) {
              d2 = d1;
              d1 = d;
            } else if (d < d2) d2 = d;
          }
        }
        // crease between cells, rounded pebble on top
        const edge = Math.min(1, (d2 - d1) * 3.2);
        h[y * size + x] = Math.sqrt(edge) + rand() * 0.04;
      }
    }
    const tex = heightToNormal(h, size, 2.2);
    return tex;
  });
}

/** Fine paint/magnesium micro texture so reflections never look like plastic. */
export function microNormal(size = 256) {
  return memo(`micro-${size}`, () => {
    const rand = mulberry(21);
    const h = new Float32Array(size * size);
    for (let i = 0; i < h.length; i++) h[i] = rand();
    // one blur pass for a soft orange-peel
    const b = new Float32Array(size * size);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        let s = 0;
        for (let oy = -1; oy <= 1; oy++)
          for (let ox = -1; ox <= 1; ox++) s += h[((y + oy + size) % size) * size + ((x + ox + size) % size)];
        b[y * size + x] = s / 9;
      }
    return heightToNormal(b, size, 1.4);
  });
}

// ---------------------------------------------------------------------------
// Printed / engraved markings
// ---------------------------------------------------------------------------

function finish(c: HTMLCanvasElement, srgb = true) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Text around a circle for the lens front bezel. The canvas maps onto a
 * RingGeometry's planar UVs: canvas radius (size/2) = ring outer radius.
 */
export function bezelText(outer: number, textRadius: number, font: string) {
  return memo(`bezel-${outer}-${textRadius}`, () => {
    const size = 2048;
    const { c, ctx } = canvas(size);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);
    const cx = size / 2;
    const r = (textRadius / outer) * (size / 2);
    const text = "SHADES OF STRATEGY  ·  50mm  1:1.2  ·  ⌀77  ·  SOS";
    ctx.fillStyle = "#d9d9d9";
    ctx.font = `500 40px ${font}`;
    ctx.textBaseline = "middle";
    const tracking = 7;
    const widths = [...text].map((ch) => ctx.measureText(ch).width + tracking);
    const total = widths.reduce((a, b) => a + b, 0);
    // Centre the string at the top of the ring (12 o'clock)
    let angle = -Math.PI / 2 - total / r / 2;
    [...text].forEach((ch, i) => {
      const w = widths[i];
      const a = angle + w / 2 / r;
      ctx.save();
      ctx.translate(cx + Math.cos(a) * r, cx + Math.sin(a) * r);
      ctx.rotate(a + Math.PI / 2);
      ctx.fillText(ch, -w / 2 + tracking / 2, 0);
      ctx.restore();
      angle += w / r;
    });
    return finish(c);
  });
}

/**
 * Distance scale printed on the focus ring band. Mapped on a lathe whose
 * U runs around the circumference; 0.5 sits at 12 o'clock.
 */
export function distanceScale(font: string) {
  return memo("distance", () => {
    const w = 4096;
    const h = 128;
    const { c, ctx } = canvas(w, h);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    const marks = ["∞", "10", "5", "3", "2", "1.5", "1.2", "1", "0.8", "0.7", "0.6", "0.5", "0.45m"];
    const span = w * 0.34;
    const start = w * 0.5 - span / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    marks.forEach((m, i) => {
      const x = start + (span * i) / (marks.length - 1);
      ctx.fillStyle = i === 0 ? "#e6e6e6" : "#bdbdbd";
      ctx.font = `500 ${i === 0 ? 50 : 36}px ${font}`;
      ctx.fillText(m, x, h * 0.36);
      ctx.fillRect(x - 1.5, h * 0.66, 3, h * 0.2);
    });
    for (let i = 0; i <= 48; i++) {
      const x = start + (span * i) / 48;
      ctx.fillStyle = "#6d6d6d";
      ctx.fillRect(x - 1, h * 0.72, 2, h * 0.12);
    }
    const tex = finish(c);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  });
}

/** Top markings for dials. */
export function dialTop(labels: string[], font: string, key: string) {
  return memo(`dial-${key}`, () => {
    const size = 512;
    const { c, ctx } = canvas(size);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);
    const cx = size / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    labels.forEach((label, i) => {
      const a = -Math.PI / 2 + (i / labels.length) * Math.PI * 2;
      const r = size * 0.36;
      ctx.save();
      ctx.translate(cx + Math.cos(a) * r, cx + Math.sin(a) * r);
      ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = label === "·" ? "#b00020" : "#cfcfcf";
      ctx.font = `600 40px ${font}`;
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cx, size * 0.22, 0, Math.PI * 2);
    ctx.stroke();
    return finish(c);
  });
}

/** The SOS mark as an alpha map (white on black), for badges and projections. */
export function markTexture(key: string, opts: { dot?: boolean; blur?: number; pad?: number } = {}) {
  return memo(`mark-${key}`, () => {
    const pad = opts.pad ?? 0.1;
    const w = 2048;
    const h = w / 2;
    const { c, ctx } = canvas(w, h);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    const scale = (w * (1 - pad * 2)) / MARK.width;
    ctx.save();
    ctx.translate(w * pad, (h - MARK.height * scale) / 2);
    ctx.scale(scale, scale);
    if (opts.blur) ctx.filter = `blur(${opts.blur / scale}px)`;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = MARK.stroke;
    ctx.stroke(new Path2D(sPath(0)));
    ctx.beginPath();
    const ox = MARK.sWidth + MARK.gap + MARK.oSize / 2;
    ctx.arc(ox, 50, 50 - MARK.stroke / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.stroke(new Path2D(sPath(MARK.sWidth + MARK.gap * 2 + MARK.oSize)));
    if (opts.dot) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(ox, 50, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return finish(c, false);
  });
}

/** A small hot point with a long soft falloff: the point of view. */
export function pointGlow() {
  return memo("point", () => {
    const size = 256;
    const { c, ctx } = canvas(size);
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.07, "rgba(255,255,255,0.85)");
    g.addColorStop(0.18, "rgba(255,255,255,0.28)");
    g.addColorStop(0.45, "rgba(255,255,255,0.06)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return finish(c, false);
  });
}

/** Soft radial glow (for the light behind the aperture). */
export function radialGlow() {
  return memo("glow", () => {
    const size = 256;
    const { c, ctx } = canvas(size);
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.55)");
    g.addColorStop(0.6, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return finish(c, false);
  });
}

/** Small printed wordmark, white on black, used as an alpha map. */
export function wordmark(text: string, font: string, key: string) {
  return memo(`word-${key}`, () => {
    const w = 1024;
    const h = 256;
    const { c, ctx } = canvas(w, h);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 150px ${font}`;
    ctx.fillText(text, w / 2, h / 2 + 6);
    return finish(c, false);
  });
}
