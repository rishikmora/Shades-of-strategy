"use client";

import { useMemo } from "react";
import { Vector2 } from "three";
import { useFrame } from "@react-three/fiber";

/**
 * @react-three/postprocessing reads the renderer size into a module-level
 * vector shared by every canvas, so a second canvas can inherit the first
 * one's size. Keep this renderer at its own measured size.
 */
export function SizeGuard() {
  const v = useMemo(() => new Vector2(), []);
  useFrame(({ gl, size }) => {
    gl.getSize(v);
    if (Math.round(v.x) !== Math.round(size.width) || Math.round(v.y) !== Math.round(size.height)) {
      gl.setSize(size.width, size.height);
    }
  });
  return null;
}
