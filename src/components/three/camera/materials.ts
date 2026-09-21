"use client";

import * as THREE from "three";
import { leatherNormal, microNormal } from "./textures";

export type Quality = "high" | "mid";

/**
 * One material library for every object on the site, so the camera, the
 * letters and the service objects all read as the same physical world:
 * satin black paint, anodised metal, rubber, leatherette, coated glass.
 */
export function createMaterials(quality: Quality) {
  const micro = microNormal();
  const leather = leatherNormal(quality === "high" ? 512 : 256);

  const paintMicro = micro.clone();
  paintMicro.repeat.set(5, 5);
  paintMicro.needsUpdate = true;
  const leatherTex = leather.clone();
  leatherTex.repeat.set(3.5, 3.5);
  leatherTex.needsUpdate = true;

  const body = new THREE.MeshPhysicalMaterial({
    name: "body-paint",
    color: new THREE.Color("#0d0d0e"),
    roughness: 0.36,
    metalness: 0.2,
    clearcoat: 0.35,
    clearcoatRoughness: 0.32,
    normalMap: paintMicro,
    normalScale: new THREE.Vector2(0.12, 0.12),
    envMapIntensity: 1,
  });

  const leatherette = new THREE.MeshPhysicalMaterial({
    name: "leatherette",
    color: new THREE.Color("#0a0a0a"),
    roughness: 0.72,
    metalness: 0,
    normalMap: leatherTex,
    normalScale: new THREE.Vector2(0.55, 0.55),
    sheen: 0.35,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color("#3a3a3a"),
  });

  const anodised = new THREE.MeshPhysicalMaterial({
    name: "anodised",
    color: new THREE.Color("#19191b"),
    metalness: 1,
    roughness: 0.47,
    anisotropy: quality === "high" ? 0.45 : 0,
    clearcoat: 0.2,
  });

  /** Knurled grips: bead-blasted, so highlights spread instead of sparkling. */
  const knurled = new THREE.MeshPhysicalMaterial({
    name: "knurled",
    color: new THREE.Color("#161618"),
    metalness: 0.85,
    roughness: 0.58,
  });

  const steel = new THREE.MeshPhysicalMaterial({
    name: "steel",
    color: new THREE.Color("#7c7c81"),
    metalness: 1,
    roughness: 0.3,
    anisotropy: quality === "high" ? 0.5 : 0,
  });

  const rubber = new THREE.MeshPhysicalMaterial({
    name: "rubber",
    color: new THREE.Color("#080808"),
    roughness: 0.86,
    metalness: 0,
    sheen: 0.25,
    sheenRoughness: 0.8,
    sheenColor: new THREE.Color("#2a2a2a"),
  });

  const barrel = new THREE.MeshPhysicalMaterial({
    name: "barrel",
    color: new THREE.Color("#0e0e0f"),
    roughness: 0.42,
    metalness: 0.35,
    clearcoat: 0.25,
    clearcoatRoughness: 0.4,
    normalMap: paintMicro,
    normalScale: new THREE.Vector2(0.08, 0.08),
  });

  /** The one red detail on the lens: a lacquered signature ring. */
  const signature = new THREE.MeshPhysicalMaterial({
    name: "signature-red",
    color: new THREE.Color("#8b0010"),
    roughness: 0.28,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });

  /** Flocked black of the lens interior. */
  const interior = new THREE.MeshStandardMaterial({
    name: "interior",
    color: new THREE.Color("#030303"),
    roughness: 0.95,
    metalness: 0,
  });

  /** Iris blades are coated matte black, like the real thing. */
  const blades = new THREE.MeshPhysicalMaterial({
    name: "blades",
    color: new THREE.Color("#0b0b0c"),
    roughness: 0.62,
    metalness: 0.35,
    side: THREE.DoubleSide,
  });

  /**
   * Multi-coated optical glass. Rendered additively so only its reflections
   * (with thin-film colour) sit on top of the dark interior, exactly how
   * a coated front element reads in a product film.
   */
  const glass = new THREE.MeshPhysicalMaterial({
    name: "glass",
    color: new THREE.Color("#000000"),
    roughness: 0.03,
    metalness: 0,
    ior: 1.9,
    specularIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    iridescence: 0.55,
    iridescenceIOR: 1.45,
    iridescenceThicknessRange: [240, 520],
    envMapIntensity: 2.6,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const innerGlass = glass.clone();
  innerGlass.name = "inner-glass";
  innerGlass.iridescenceThicknessRange = [380, 700];
  innerGlass.envMapIntensity = 1.4;

  /** Dark glass for screens and the viewfinder. */
  const screen = new THREE.MeshPhysicalMaterial({
    name: "screen",
    color: new THREE.Color("#020203"),
    roughness: 0.06,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  });

  const print = new THREE.MeshPhysicalMaterial({
    name: "print",
    color: new THREE.Color("#cfcfcf"),
    roughness: 0.5,
    metalness: 0.2,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });

  const afLamp = new THREE.MeshPhysicalMaterial({
    name: "af-lamp",
    color: new THREE.Color("#1a0003"),
    emissive: new THREE.Color("#b00020"),
    emissiveIntensity: 0.06,
    roughness: 0.08,
    clearcoat: 1,
  });

  /** Red light seen through the aperture: the point of view. */
  const glow = new THREE.MeshBasicMaterial({
    name: "glow",
    color: new THREE.Color("#b00020"),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });

  /** Monumental letters share the camera's paint, a touch more metallic. */
  const letter = new THREE.MeshPhysicalMaterial({
    name: "letter",
    color: new THREE.Color("#0c0c0d"),
    roughness: 0.3,
    metalness: 0.55,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    normalMap: paintMicro,
    normalScale: new THREE.Vector2(0.06, 0.06),
  });

  return {
    body,
    leatherette,
    anodised,
    knurled,
    steel,
    rubber,
    barrel,
    signature,
    interior,
    blades,
    glass,
    innerGlass,
    screen,
    print,
    afLamp,
    glow,
    letter,
  };
}

export type Materials = ReturnType<typeof createMaterials>;

export function disposeMaterials(m: Materials) {
  Object.values(m).forEach((mat) => mat.dispose());
}
