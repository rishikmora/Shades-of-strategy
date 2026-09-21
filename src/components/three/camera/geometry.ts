"use client";

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { MARK, sOutline } from "@/lib/monogram";

/**
 * Geometry helpers for machined, turned and moulded parts.
 * Everything that is round is turned on a lathe around the Z axis
 * (the optical axis), exactly like the real parts would be.
 */

export type Profile = [radius: number, z: number][];

/**
 * Lathe around the Z axis with an optional radial displacement, used for
 * ribbed rubber, knurled metal and grip patterns.
 */
export function lathe(
  profile: Profile,
  segments = 128,
  displace?: (angle: number, r: number, z: number, t: number) => number,
) {
  const pts = profile.map(([r, z]) => new THREE.Vector2(Math.max(r, 0.0001), z));
  const g = new THREE.LatheGeometry(pts, segments);
  if (displace) {
    const pos = g.attributes.position;
    const rs = profile.map((p) => p[0]);
    const rMin = Math.min(...rs);
    const rMax = Math.max(...rs);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = pos.getY(i);
      const r = Math.hypot(x, z);
      if (r < 1e-5) continue;
      const a = Math.atan2(x, z);
      const t = rMax > rMin ? (r - rMin) / (rMax - rMin) : 1;
      const nr = displace(a, r, y, t);
      pos.setX(i, (x / r) * nr);
      pos.setZ(i, (z / r) * nr);
    }
    g.computeVertexNormals();
  }
  // Lathe revolves around +Y; turn so the axis becomes +Z.
  g.rotateX(Math.PI / 2);
  return g;
}

/** Densely sampled straight band [r, z0 → z1] with chamfered edges. */
export function band(r: number, z0: number, z1: number, chamfer = 0.006, steps = 2): Profile {
  const p: Profile = [[r - chamfer, z0], [r, z0 + chamfer]];
  for (let i = 1; i < steps; i++) p.push([r, z0 + chamfer + ((z1 - z0 - chamfer * 2) * i) / steps]);
  p.push([r, z1 - chamfer], [r - chamfer, z1]);
  return p;
}

/** Soft square-wave ribs, 0 → 1 */
export function rib(angle: number, count: number, sharp = 4) {
  return 0.5 + 0.5 * Math.tanh(sharp * Math.sin(angle * count));
}

/** Diamond knurl, 0 → 1 */
export function knurl(angle: number, z: number, count: number, pitch: number) {
  const u = Math.abs(Math.sin(angle * count + z * pitch));
  const v = Math.abs(Math.sin(angle * count - z * pitch));
  return Math.min(u, v);
}

/** Ring face (annulus) facing +Z. */
export function annulus(inner: number, outer: number, segments = 128) {
  return new THREE.RingGeometry(inner, outer, segments, 1);
}

/** Convex spherical cap facing +Z with its rim at z = 0. */
export function glassCap(rimRadius: number, sag: number, segments = 96) {
  const R = (rimRadius * rimRadius + sag * sag) / (2 * sag);
  const theta = Math.asin(rimRadius / R);
  const g = new THREE.SphereGeometry(R, segments, 24, 0, Math.PI * 2, 0, theta);
  g.rotateX(Math.PI / 2);
  g.translate(0, 0, -(R - sag));
  return g;
}

export function roundedBox(w: number, h: number, d: number, radius: number, segments = 5) {
  return new RoundedBoxGeometry(w, h, d, segments, radius);
}

/**
 * Extrude a 2D outline (u, v) along a depth, with soft bevels.
 */
export function extrude(
  shape: THREE.Shape,
  depth: number,
  bevel: number,
  bevelSegments = 5,
  curveSegments = 24,
) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments,
    curveSegments,
  });
  return g;
}

/** The S letter as a solid, bevelled extrusion, `height` tall, centred. */
export function sLetter(height: number, depth: number, quality: "high" | "mid" = "high") {
  const scale = height / MARK.height;
  const pts = sOutline(quality === "high" ? 72 : 36).map(([x, y]) => new THREE.Vector2(x * scale, y * scale));
  const shape = new THREE.Shape(pts);
  const bevel = height * 0.012;
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments: quality === "high" ? 4 : 2,
    curveSegments: 1,
  });
  g.center();
  g.computeVertexNormals();
  return g;
}

/** A ring (the O) as a solid, bevelled extrusion. */
export function oLetter(height: number, depth: number, quality: "high" | "mid" = "high") {
  const scale = height / MARK.height;
  const outer = 50 * scale;
  const inner = (50 - MARK.stroke) * scale;
  const shape = new THREE.Shape().absarc(0, 0, outer, 0, Math.PI * 2, false);
  shape.holes.push(new THREE.Path().absarc(0, 0, inner, 0, Math.PI * 2, true));
  const bevel = height * 0.012;
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments: quality === "high" ? 4 : 2,
    curveSegments: quality === "high" ? 96 : 48,
  });
  g.center();
  return g;
}
