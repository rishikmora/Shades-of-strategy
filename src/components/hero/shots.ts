/**
 * The opening film, as a shot list. Each keyframe is a moment in the scroll
 * (t: 0 → 1). Values carry forward until changed. Between keyframes every
 * parameter eases in and out, like a camera operator on a slider.
 *
 * Frames (see siteConfig.hero.frames):
 *   01 darkness · 02 the lens · 03 pull back · 04 sideways · 05 rotate · 06 SOS
 */

export type Vec3 = [number, number, number];

export type Shot = {
  /** point the camera looks at (world) */
  target: Vec3;
  /** orbit distance, azimuth (rad, 0 = front), elevation (rad) */
  dist: number;
  az: number;
  el: number;
  roll: number;
  fov: number;
  /** frame the subject off-centre (fraction of viewport) */
  shiftX: number;
  shiftY: number;
  /** product turntable rotation */
  rotY: number;
  /** focus distance offset from the target (world units) and bokeh size */
  focus: number;
  bokeh: number;
  /** 0 = stopped down, 1 = wide open */
  aperture: number;
  /** focus ring angle */
  focusRing: number;
  /** light levels */
  rim: number;
  edge: number;
  key: number;
  env: number;
  envRot: number;
  sweep: number;
  /** environment: red-black amount, SOS projection, floor reflection */
  red: number;
  mono: number;
  floor: number;
  /** light seen through the aperture */
  glow: number;
  /** lens separates, body recedes */
  explode: number;
  /** S letters arrive */
  letters: number;
};

export type Keyframe = { t: number } & Partial<Shot>;

const base: Shot = {
  target: [0, 0.4, 0.87],
  dist: 1.05,
  az: 0.14,
  el: 0.03,
  roll: -0.12,
  fov: 26,
  shiftX: 0,
  shiftY: 0,
  rotY: 0,
  focus: 2.2,
  bokeh: 7,
  aperture: 0.25,
  focusRing: 0,
  rim: 0,
  edge: 0,
  key: 0,
  env: 0,
  envRot: -0.4,
  sweep: 0,
  red: 0,
  mono: 0,
  floor: 0,
  glow: 0,
  explode: 0,
  letters: 0,
};

export const keyframes: Keyframe[] = [
  // 01 — almost complete darkness
  { t: 0 },
  // a line of red light finds the edge of the lens
  { t: 0.085, edge: 1, rim: 0.15, glow: 0.12, env: 0.03, roll: -0.08 },
  // 02 — the lens fills the screen, out of focus
  { t: 0.15, dist: 0.92, az: 0.06, roll: -0.03, env: 0.55, key: 0.25, glow: 0.45, focus: 1.1, bokeh: 6, aperture: 0.28, focusRing: 0.5, envRot: 0 },
  // …and slowly moves into focus
  { t: 0.27, dist: 0.8, az: -0.03, el: 0.0, roll: 0, env: 0.85, key: 0.35, glow: 0.9, focus: 0.2, bokeh: 1.1, aperture: 0.62, focusRing: 1.35, envRot: 0.35 },
  // 03 — pull back: the body emerges, the reflection turns red
  { t: 0.36, target: [0, 0.42, 0.3], dist: 3.7, az: 0.02, el: 0.07, fov: 28, shiftX: 0.17, shiftY: 0.02, focus: 0, bokeh: 2.2, aperture: 0.7, focusRing: 1.9, rim: 0.7, edge: 0, key: 0.9, env: 1, envRot: 2.5, glow: 0.5, floor: 1 },
  { t: 0.45, dist: 3.95, az: 0.07, el: 0.085, envRot: 2.85, focusRing: 2.1 },
  // 04 — the camera moves sideways; darkness turns red-black
  { t: 0.52, target: [0.05, 0.43, 0.25], dist: 3.45, az: 0.9, el: 0.13, shiftX: -0.19, red: 0.65, envRot: 3.6, sweep: 0.45, rim: 1, key: 0.75 },
  { t: 0.61, dist: 3.3, az: 1.02, el: 0.15, red: 0.8, sweep: 0.75, envRot: 3.9 },
  // 05 — the camera rotates; the monogram appears in the environment
  { t: 0.68, target: [0, 0.44, 0.1], dist: 3.55, az: 0.32, el: 0.1, shiftX: 0.2, rotY: -1.05, red: 0.9, mono: 0.55, sweep: 1, envRot: 4.7, key: 0.6 },
  { t: 0.77, dist: 3.75, az: 0.26, rotY: -1.25, mono: 1, envRot: 4.95 },
  // 06 — the object transforms: S · lens · S
  { t: 0.86, target: [0, 0.42, 0.7], dist: 4.6, az: 0, el: 0.045, fov: 27, shiftX: 0, shiftY: 0.1, rotY: 0, explode: 0.75, letters: 0.55, mono: 0.35, red: 0.7, envRot: 6.1, sweep: 0.6, rim: 1, key: 0.7, glow: 0.8, aperture: 0.55 },
  { t: 0.94, dist: 4.75, explode: 1, letters: 1, mono: 0.12, red: 0.55, envRot: 6.3 },
  { t: 1, dist: 4.95, el: 0.04, glow: 1 },
];

/** Resolve carry-forward values so every keyframe is a full Shot. */
function resolve(frames: Keyframe[]): (Shot & { t: number })[] {
  let prev: Shot = base;
  return frames.map((k) => {
    const full = { ...prev, ...k } as Shot & { t: number };
    prev = full;
    return full;
  });
}

const resolved = resolve(keyframes);

const easeInOut = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Sample the shot list at progress p (0 → 1). Writes into `out`. */
export function sampleShot(p: number, out: Shot) {
  const frames = resolved;
  let i = 0;
  while (i < frames.length - 2 && p > frames[i + 1].t) i++;
  const a = frames[i];
  const b = frames[i + 1];
  const u = Math.min(1, Math.max(0, (p - a.t) / Math.max(1e-6, b.t - a.t)));
  const e = easeInOut(u);
  const o = out as unknown as Record<string, number | Vec3>;
  const A = a as unknown as Record<string, number | Vec3>;
  const B = b as unknown as Record<string, number | Vec3>;
  for (const key of Object.keys(base)) {
    const va = A[key];
    const vb = B[key];
    if (Array.isArray(va) && Array.isArray(vb)) {
      const v = (o[key] as Vec3) ?? [0, 0, 0];
      v[0] = lerp(va[0], vb[0], e);
      v[1] = lerp(va[1], vb[1], e);
      v[2] = lerp(va[2], vb[2], e);
      o[key] = v;
    } else {
      o[key] = lerp(va as number, vb as number, e);
    }
  }
  return out;
}

export function createShot(): Shot {
  return { ...base, target: [...base.target] as Vec3 };
}

/** Frame boundaries used by the DOM text timeline (in / out). */
export const frameWindows: { in: [number, number]; out: [number, number] | null }[] = [
  { in: [0, 0], out: [0.07, 0.11] },
  { in: [0.13, 0.17], out: [0.265, 0.3] },
  { in: [0.35, 0.385], out: [0.45, 0.48] },
  { in: [0.525, 0.56], out: [0.615, 0.645] },
  { in: [0.69, 0.725], out: [0.785, 0.815] },
  { in: [0.875, 0.92], out: null },
];

/** A static, composed shot for reduced motion and posters. */
export const stillShots = {
  lens: 0.27,
  body: 0.56,
  sos: 1,
};
