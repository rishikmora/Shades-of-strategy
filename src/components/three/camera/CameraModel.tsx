"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import {
  annulus,
  band,
  extrude,
  glassCap,
  knurl,
  lathe,
  rib,
  roundedBox,
  type Profile,
} from "./geometry";
import type { Materials, Quality } from "./materials";
import { bezelText, cssFont, dialTop, distanceScale, markTexture, pointGlow } from "./textures";

/**
 * A mirrorless cinema/stills body with a fast 50mm prime.
 * Built entirely from turned, extruded and moulded primitives.
 *
 * Local space: optical axis = +Z, origin at the centre of the body,
 * body bottom at y = -0.40. Lens mount plane at z = +0.22.
 */

export const CAMERA = {
  bodyBottom: -0.4,
  mountZ: 0.22,
  /** z of the front element apex, in lens space */
  frontZ: 0.65,
  lensRadius: 0.368,
};

export type CameraRig = {
  root: THREE.Group;
  body: THREE.Group;
  lens: THREE.Group;
  focus: THREE.Group;
  setAperture: (open: number) => void;
  materials: Materials;
};

type Props = ThreeElements["group"] & {
  quality: Quality;
  materials: Materials;
  onRig?: (rig: CameraRig) => void;
};

const BLADES = 9;

function useCameraGeometry(quality: Quality) {
  return useMemo(() => {
    const hi = quality === "high";
    const seg = hi ? 160 : 72;

    // ---------------- body ----------------
    const body = roundedBox(1.3, 0.8, 0.44, 0.065, hi ? 6 : 3);

    const gripShape = new THREE.Shape();
    gripShape.moveTo(-0.6, 0.06);
    gripShape.lineTo(-0.405, 0.06);
    gripShape.lineTo(-0.405, 0.24);
    gripShape.bezierCurveTo(-0.405, 0.37, -0.45, 0.415, -0.51, 0.415);
    gripShape.bezierCurveTo(-0.575, 0.415, -0.6, 0.36, -0.6, 0.28);
    gripShape.lineTo(-0.6, 0.06);
    const grip = extrude(gripShape, 0.74, 0.04, hi ? 6 : 3, hi ? 32 : 16);
    grip.rotateX(Math.PI / 2);
    grip.translate(0, 0.36, 0);

    const humpShape = new THREE.Shape();
    humpShape.moveTo(-0.235, 0);
    humpShape.lineTo(0.235, 0);
    humpShape.lineTo(0.175, 0.165);
    humpShape.quadraticCurveTo(0.16, 0.2, 0.12, 0.2);
    humpShape.lineTo(-0.12, 0.2);
    humpShape.quadraticCurveTo(-0.16, 0.2, -0.175, 0.165);
    humpShape.closePath();
    const hump = extrude(humpShape, 0.3, 0.03, hi ? 5 : 2, 16);
    hump.translate(0, 0.37, -0.18);

    const sidePanel = roundedBox(0.25, 0.62, 0.014, 0.006, 2);

    // Dials: turned with straight knurl on the rim
    const dial = (r: number, h: number, ribs: number) =>
      lathe(
        [
          [0.0001, 0],
          [r - 0.006, 0],
          [r, 0.006],
          [r, h - 0.008],
          [r - 0.008, h],
          [r * 0.55, h + 0.002],
          [0.0001, h + 0.002],
        ],
        hi ? ribs * 6 : ribs * 3,
        (a, rr, _z, t) => (t > 0.97 ? rr + 0.0035 * rib(a, ribs, 5) : rr),
      );
    const modeDial = dial(0.105, 0.062, 56);
    const compDial = dial(0.085, 0.052, 48);
    const dialFace = new THREE.CircleGeometry(0.09, 64);

    const collar = lathe(band(0.07, 0, 0.024, 0.004), 64);
    const shutter = lathe(
      [
        [0.0001, 0.034],
        [0.034, 0.03],
        [0.042, 0.027],
        [0.043, 0.02],
        [0.043, 0],
      ].reverse() as Profile,
      64,
    );

    const lug = new THREE.TorusGeometry(0.03, 0.009, 12, 36);
    const lugBase = roundedBox(0.03, 0.08, 0.06, 0.012, 2);

    const releaseBtn = lathe(
      [
        [0.0001, 0.018],
        [0.036, 0.016],
        [0.04, 0.01],
        [0.04, 0],
      ].reverse() as Profile,
      48,
    );
    const releaseBezel = annulus(0.04, 0.05, 48);
    const afLamp = new THREE.CircleGeometry(0.026, 40);

    const hotShoe = roundedBox(0.17, 0.012, 0.17, 0.004, 2);
    const rail = new THREE.BoxGeometry(0.014, 0.018, 0.17);

    const lcd = roundedBox(0.8, 0.52, 0.02, 0.012, 3);
    const lcdGlass = new THREE.PlaneGeometry(0.74, 0.46);
    const eyecup = roundedBox(0.3, 0.19, 0.09, 0.04, hi ? 4 : 2);
    const eyepiece = new THREE.PlaneGeometry(0.17, 0.09);
    const rearBtn = lathe(band(0.026, 0, 0.014, 0.004), 32);
    const rearDial = lathe(band(0.075, 0, 0.022, 0.005, 3), hi ? 240 : 96, (a, r, _z, t) =>
      t > 0.9 ? r + 0.003 * rib(a, 40, 5) : r,
    );

    const badge = new THREE.PlaneGeometry(0.15, 0.075);

    // ---------------- lens ----------------
    const mount = lathe(
      [
        [0.305, -0.004],
        [0.34, -0.004],
        [0.342, 0.004],
        [0.342, 0.024],
        [0.334, 0.03],
      ],
      seg,
    );
    const rearBarrel = lathe(
      [
        [0.334, 0.03],
        [0.338, 0.036],
        [0.338, 0.094],
        [0.334, 0.1],
      ],
      seg,
    );
    const controlRing = lathe(
      band(0.343, 0.1, 0.176, 0.005, hi ? 18 : 2),
      hi ? 540 : 180,
      hi
        ? (a, r, z, t) => (t > 0.9 ? r + 0.0036 * knurl(a, z, 90, 700) : r)
        : (a, r, _z, t) => (t > 0.9 ? r + 0.003 * rib(a, 90, 3) : r),
    );
    const indexBand = lathe(band(0.341, 0.176, 0.222, 0.004), seg);
    const indexMark = new THREE.BoxGeometry(0.006, 0.004, 0.02);

    const scaleBand = lathe(band(0.346, 0.222, 0.272, 0.004), seg);
    const focusRubber = lathe(
      band(0.356, 0.272, 0.49, 0.01, 3),
      hi ? 72 * 10 : 72 * 4,
      (a, r, _z, t) => (t > 0.85 ? r + 0.0095 * rib(a, 72, 3.2) : r),
    );
    const frontBarrel = lathe(
      [
        [0.35, 0.49],
        [0.356, 0.496],
        [0.358, 0.54],
        [0.364, 0.585],
        [0.368, 0.618],
        [0.368, 0.642],
        [0.362, 0.652],
      ],
      seg,
    );
    const redRing = lathe(band(0.3675, 0.598, 0.607, 0.0015), seg);
    const bezel = annulus(0.298, 0.362, seg);
    const filterWall = lathe(
      [
        [0.298, 0.652],
        [0.298, 0.628],
      ],
      seg,
    );
    // retaining ring overlaps the rim of the front element
    const step = annulus(0.27, 0.298, seg);
    const front = glassCap(0.285, 0.036, hi ? 96 : 48);
    front.translate(0, 0, 0.614);
    const tube = lathe(
      [
        [0.286, 0.614],
        [0.286, 0.3],
      ],
      seg,
    );
    const baffle = annulus(0.232, 0.286, seg);
    const inner = glassCap(0.232, 0.024, hi ? 64 : 32);
    inner.translate(0, 0, 0.53);
    const third = glassCap(0.18, 0.018, hi ? 48 : 24);
    third.translate(0, 0, 0.44);
    const glowDisc = new THREE.CircleGeometry(0.26, 64);
    const backCap = new THREE.CircleGeometry(0.29, 64);

    // One iris blade = the circular segment of the barrel beyond a chord.
    // All nine share it; it is rewritten whenever the aperture changes.
    const blade = new THREE.BufferGeometry();
    const arc = hi ? 40 : 20;
    blade.setAttribute("position", new THREE.BufferAttribute(new Float32Array((arc + 2) * 3), 3));
    blade.setAttribute("normal", new THREE.BufferAttribute(new Float32Array((arc + 2) * 3), 3));
    const idx: number[] = [];
    for (let k = 1; k <= arc; k++) idx.push(0, k, k + 1);
    blade.setIndex(idx);
    const nrm = blade.attributes.normal as THREE.BufferAttribute;
    for (let k = 0; k < arc + 2; k++) nrm.setXYZ(k, 0, 0, 1);

    return {
      body,
      grip,
      hump,
      sidePanel,
      modeDial,
      compDial,
      dialFace,
      collar,
      shutter,
      lug,
      lugBase,
      releaseBtn,
      releaseBezel,
      afLamp,
      hotShoe,
      rail,
      lcd,
      lcdGlass,
      eyecup,
      eyepiece,
      rearBtn,
      rearDial,
      badge,
      mount,
      rearBarrel,
      controlRing,
      indexBand,
      indexMark,
      scaleBand,
      focusRubber,
      frontBarrel,
      redRing,
      bezel,
      filterWall,
      step,
      front,
      tube,
      baffle,
      inner,
      third,
      glowDisc,
      backCap,
      blade,
    };
  }, [quality]);
}

function useDecals(materials: Materials) {
  return useMemo(() => {
    const font = cssFont("--font-instrument-sans", "Helvetica, Arial, sans-serif");
    const bezel = materials.barrel.clone();
    bezel.name = "bezel-print";
    bezel.color.set("#ffffff");
    bezel.map = bezelText(0.362, 0.33, font);
    bezel.normalMap = null;

    const scale = materials.barrel.clone();
    scale.name = "scale-print";
    scale.color.set("#ffffff");
    scale.map = distanceScale(font);
    scale.normalMap = null;

    const mode = materials.print.clone();
    mode.alphaMap = dialTop(["M", "A", "S", "P", "·", "C1", "C2", "▶"], font, "mode");
    const comp = materials.print.clone();
    comp.alphaMap = dialTop(["0", "+1", "+2", "+3", "·", "−3", "−2", "−1"], font, "comp");

    const badge = materials.print.clone();
    badge.alphaMap = markTexture("badge", { dot: false, pad: 0.06 });
    badge.color.set("#b9b9bd");
    badge.metalness = 0.9;
    badge.roughness = 0.25;

    const glow = materials.glow;
    glow.map = pointGlow();

    return { bezel, scale, mode, comp, badge };
  }, [materials]);
}

export function CameraModel({ quality, materials: m, onRig, ...props }: Props) {
  const g = useCameraGeometry(quality);
  const d = useDecals(m);

  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const lens = useRef<THREE.Group>(null);
  const focus = useRef<THREE.Group>(null);
  const blades = useRef<(THREE.Mesh | null)[]>([]);

  useEffect(() => {
    if (!root.current || !body.current || !lens.current || !focus.current) return;
    const pos = g.blade.attributes.position as THREE.BufferAttribute;
    const arc = pos.count - 2;
    const R = 0.29;
    let last = -1;
    const setAperture = (open: number) => {
      if (Math.abs(open - last) < 0.0005) return;
      last = open;
      const a = 0.05 + open * 0.2;
      // rewrite the shared segment: fan from the chord midpoint
      const alpha = Math.asin(Math.min(0.999, a / R));
      pos.setXYZ(0, 0, a, 0);
      for (let k = 0; k <= arc; k++) {
        const t = alpha + ((Math.PI - 2 * alpha) * k) / arc;
        pos.setXYZ(k + 1, Math.cos(t) * R, Math.sin(t) * R, 0);
      }
      pos.needsUpdate = true;
      g.blade.computeBoundingSphere();
      // the iris turns slightly as it opens, like a real diaphragm
      const swirl = open * 0.35;
      blades.current.forEach((b, i) => {
        if (!b) return;
        const phi = (i / BLADES) * Math.PI * 2 + swirl;
        b.position.set(0, 0, 0.4 + i * 0.0009);
        b.rotation.set(0.05, 0, phi - Math.PI / 2, "ZYX");
      });
    };
    setAperture(0.6);
    onRig?.({
      root: root.current,
      body: body.current,
      lens: lens.current,
      focus: focus.current,
      setAperture,
      materials: m,
    });
  }, [m, onRig, g]);

  useEffect(
    () => () => {
      Object.values(g).forEach((geo) => geo.dispose());
      Object.values(d).forEach((mat) => mat.dispose());
    },
    [g, d],
  );

  const hi = quality === "high";

  return (
    <group ref={root} {...props}>
      {/* ============================ BODY ============================ */}
      <group ref={body}>
        <mesh geometry={g.body} material={m.body} castShadow receiveShadow />
        <mesh geometry={g.grip} material={[m.body, m.leatherette]} castShadow />
        <mesh geometry={g.hump} material={m.body} castShadow />
        <mesh geometry={g.sidePanel} material={m.leatherette} position={[0.49, -0.035, 0.222]} />

        {/* Brand badge on the viewfinder */}
        <mesh geometry={g.badge} material={d.badge} position={[0, 0.47, 0.1515]} />

        {/* Hot shoe */}
        <mesh geometry={g.hotShoe} material={m.steel} position={[0, 0.603, -0.035]} />
        <mesh geometry={g.rail} material={m.steel} position={[0.074, 0.612, -0.035]} />
        <mesh geometry={g.rail} material={m.steel} position={[-0.074, 0.612, -0.035]} />

        {/* Mode dial (camera left, viewer right) */}
        <group position={[0.4, 0.4, -0.05]}>
          <mesh geometry={g.modeDial} material={m.knurled} rotation-x={-Math.PI / 2} />
          <mesh
            geometry={g.dialFace}
            material={d.mode}
            rotation-x={-Math.PI / 2}
            position-y={0.0645}
          />
        </group>

        {/* Exposure compensation dial */}
        <group position={[-0.24, 0.4, -0.08]}>
          <mesh geometry={g.compDial} material={m.knurled} rotation-x={-Math.PI / 2} />
          <mesh
            geometry={g.dialFace}
            material={d.comp}
            rotation-x={-Math.PI / 2}
            position-y={0.0545}
            scale={0.82}
          />
        </group>

        {/* Shutter button on the grip */}
        <group position={[-0.505, 0.4, 0.27]}>
          <mesh geometry={g.collar} material={m.anodised} rotation-x={-Math.PI / 2} />
          <mesh geometry={g.shutter} material={m.steel} rotation-x={-Math.PI / 2} position-y={0.022} />
        </group>

        {/* Strap lugs */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.655, 0.27, -0.02]}>
            <mesh geometry={g.lugBase} material={m.body} position-x={s * -0.005} />
            <mesh geometry={g.lug} material={m.steel} rotation-y={Math.PI / 2} position-x={s * 0.022} />
          </group>
        ))}

        {/* Front details */}
        <group position={[0.415, 0.13, 0.229]}>
          <mesh geometry={g.releaseBezel} material={m.anodised} position-z={0.0015} />
          <mesh geometry={g.releaseBtn} material={m.steel} />
        </group>
        <mesh geometry={g.afLamp} material={m.afLamp} position={[-0.3, 0.3, 0.2215]} />

        {/* Rear: screen, viewfinder, controls */}
        <mesh geometry={g.lcd} material={m.body} position={[0.1, -0.05, -0.226]} />
        <mesh
          geometry={g.lcdGlass}
          material={m.screen}
          position={[0.1, -0.05, -0.2371]}
          rotation-y={Math.PI}
        />
        <mesh geometry={g.eyecup} material={m.rubber} position={[0, 0.49, -0.245]} />
        <mesh
          geometry={g.eyepiece}
          material={m.screen}
          position={[0, 0.49, -0.2906]}
          rotation-y={Math.PI}
        />
        <mesh
          geometry={g.rearDial}
          material={m.knurled}
          position={[-0.47, -0.06, -0.222]}
          rotation-y={Math.PI}
        />
        {[
          [-0.47, 0.2],
          [-0.47, 0.1],
          [-0.47, -0.22],
          [-0.36, 0.28],
        ].map(([x, y], i) => (
          <mesh
            key={i}
            geometry={g.rearBtn}
            material={m.anodised}
            position={[x, y, -0.221]}
            rotation-y={Math.PI}
          />
        ))}
      </group>

      {/* ============================ LENS ============================ */}
      <group ref={lens} position-z={CAMERA.mountZ}>
        <mesh geometry={g.mount} material={m.anodised} />
        <mesh geometry={g.rearBarrel} material={m.barrel} castShadow />
        <mesh geometry={g.controlRing} material={m.knurled} castShadow />
        <mesh geometry={g.indexBand} material={m.barrel} castShadow />
        <mesh geometry={g.indexMark} material={m.signature} position={[0, 0.3445, 0.2]} />

        {/* Focus group turns as one: distance scale + ribbed rubber */}
        <group ref={focus}>
          <mesh geometry={g.scaleBand} material={d.scale} castShadow />
          <mesh geometry={g.focusRubber} material={m.rubber} castShadow />
        </group>

        <mesh geometry={g.frontBarrel} material={m.barrel} castShadow />
        <mesh geometry={g.redRing} material={m.signature} />
        <mesh geometry={g.bezel} material={d.bezel} position-z={0.652} />
        <mesh geometry={g.filterWall} material={m.anodised} />
        <mesh geometry={g.step} material={m.interior} position-z={0.628} />

        {/* Optical path, front to back */}
        <mesh geometry={g.tube} material={m.interior} />
        <mesh geometry={g.baffle} material={m.interior} position-z={0.585} />
        <mesh geometry={g.baffle} material={m.interior} position-z={0.5} scale={0.96} />
        <mesh geometry={g.front} material={m.glass} renderOrder={3} />
        <mesh geometry={g.inner} material={m.innerGlass} renderOrder={2} />
        {hi && <mesh geometry={g.third} material={m.innerGlass} renderOrder={1} />}

        {/* Aperture iris */}
        {Array.from({ length: BLADES }).map((_, i) => (
          <mesh
            key={i}
            ref={(el) => {
              blades.current[i] = el;
            }}
            geometry={g.blade}
            material={m.blades}
          />
        ))}

        {/* The red point of view */}
        <mesh geometry={g.glowDisc} material={m.glow} position-z={0.34} />
        <mesh geometry={g.backCap} material={m.interior} position-z={0.305} />
      </group>
    </group>
  );
}
