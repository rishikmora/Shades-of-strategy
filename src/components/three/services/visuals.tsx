"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CameraModel, type CameraRig } from "@/components/three/camera/CameraModel";
import type { Materials, Quality } from "@/components/three/camera/materials";
import { oLetter, roundedBox, sLetter } from "@/components/three/camera/geometry";
import { appScreen, eventPrint, webHero } from "./textures";

export type VisualProps = {
  materials: Materials;
  quality: Quality;
  /** this object is the one on stage */
  on: boolean;
  reduced: boolean;
  presence: React.RefObject<number>;
};

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function useDisposable<T extends { dispose: () => void }>(factory: () => T, deps: React.DependencyList) {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are forwarded by the caller
  const value = useMemo(factory, deps);
  useEffect(() => () => value.dispose(), [value]);
  return value;
}

// ---------------------------------------------------------------------------
// 01 PHOTOGRAPHY — the camera, and the moment the shutter fires
// ---------------------------------------------------------------------------

export function PhotographyVisual({ materials, quality, on, reduced }: VisualProps) {
  const rig = useRef<CameraRig | null>(null);
  const root = useRef<THREE.Group>(null);
  const flash = useRef<THREE.PointLight>(null);
  const fireAt = useRef(Infinity);
  const onRig = useCallback((r: CameraRig) => {
    rig.current = r;
  }, []);

  useEffect(() => {
    if (on) fireAt.current = performance.now() / 1000 + 0.9;
  }, [on]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (root.current) {
      root.current.rotation.y = -0.66 + (reduced ? 0 : Math.sin(t * 0.32) * 0.12);
      root.current.position.y = -0.12 + (reduced ? 0 : Math.sin(t * 0.55) * 0.025);
    }
    const now = performance.now() / 1000;
    const dt = now - fireAt.current;
    let open = 0.72;
    if (dt > 0 && dt < 0.42) open = 0.72 * (1 - Math.sin((dt / 0.42) * Math.PI) * 0.94);
    rig.current?.setAperture(open);
    if (rig.current) rig.current.focus.rotation.z = reduced ? 0 : Math.sin(t * 0.4) * 0.3;
    if (flash.current) flash.current.intensity = dt > 0.05 && dt < 0.35 ? (1 - (dt - 0.05) / 0.3) * 9 : 0;
    if (on && !reduced && dt > 4.2) fireAt.current = now + 0.1;
  });

  return (
    <group ref={root} scale={1.5}>
      <CameraModel quality={quality} materials={materials} onRig={onRig} />
      <pointLight ref={flash} position={[0.2, 0.9, 1.6]} color="#ffffff" decay={2} intensity={0} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// 02 VIDEOGRAPHY — a lens travelling through a cinematic frame
// ---------------------------------------------------------------------------

export function VideographyVisual({ materials, quality, reduced }: VisualProps) {
  const lens = useRef<THREE.Group>(null);
  const rig = useRef<CameraRig | null>(null);
  const onRig = useCallback((r: CameraRig) => {
    rig.current = r;
    r.body.visible = false;
    r.setAperture(0.5);
  }, []);

  const W = 3;
  const H = W / 2.39;
  const bar = 0.022;
  const geo = useDisposable(() => new THREE.BoxGeometry(1, 1, 1), []);

  useFrame(({ clock }) => {
    const t = reduced ? 1.2 : clock.elapsedTime;
    const g = lens.current;
    if (!g) return;
    const u = t * 0.28;
    g.position.set(Math.sin(u) * 1.05, Math.sin(u * 2) * 0.06, 0.3 + Math.cos(u) * 0.45);
    g.rotation.set(0.05, 0.95 + Math.sin(u) * 0.35, 0);
    if (rig.current) rig.current.focus.rotation.z = t * 0.5;
  });

  const corner = (x: number, y: number) => {
    const sx = Math.sign(x);
    const sy = Math.sign(y);
    return (
      <group key={`${x}${y}`} position={[x + sx * 0.08, y + sy * 0.08, 0.02]}>
        <mesh geometry={geo} material={materials.steel} scale={[0.22, 0.012, 0.012]} position={[-sx * 0.11, 0, 0]} />
        <mesh geometry={geo} material={materials.steel} scale={[0.012, 0.22, 0.012]} position={[0, -sy * 0.11, 0]} />
      </group>
    );
  };

  return (
    <group position={[0, 0.05, 0]}>
      {/* the frame: 2.39:1 */}
      <group position-z={-0.4}>
        <mesh geometry={geo} material={materials.anodised} scale={[W, bar, 0.04]} position={[0, H / 2, 0]} />
        <mesh geometry={geo} material={materials.anodised} scale={[W, bar, 0.04]} position={[0, -H / 2, 0]} />
        <mesh geometry={geo} material={materials.anodised} scale={[bar, H, 0.04]} position={[-W / 2, 0, 0]} />
        <mesh geometry={geo} material={materials.anodised} scale={[bar, H, 0.04]} position={[W / 2, 0, 0]} />
        {corner(-W / 2, H / 2)}
        {corner(W / 2, H / 2)}
        {corner(-W / 2, -H / 2)}
        {corner(W / 2, -H / 2)}
        {/* centre mark */}
        <mesh geometry={geo} material={materials.signature} scale={[0.1, 0.006, 0.006]} />
        <mesh geometry={geo} material={materials.signature} scale={[0.006, 0.1, 0.006]} />
      </group>
      <group ref={lens} scale={1.25}>
        <group position-z={-0.55}>
          <CameraModel quality={quality} materials={materials} onRig={onRig} />
        </group>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 03 VIDEO EDITING — a timeline assembling itself
// ---------------------------------------------------------------------------

const CLIPS: [track: number, start: number, len: number][] = [
  [0, 0, 0.8],
  [0, 0.84, 0.46],
  [0, 1.34, 1.05],
  [0, 2.43, 0.77],
  [1, 0.3, 0.62],
  [1, 0.96, 0.9],
  [1, 1.9, 0.5],
  [2, 0, 1.5],
  [2, 1.56, 1.64],
];

export function EditingVisual({ materials, on, reduced }: VisualProps) {
  const clips = useRef<(THREE.Mesh | null)[]>([]);
  const head = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);
  const build = useRef(0);
  const box = useDisposable(() => roundedBox(1, 1, 1, 0.08, 3), []);
  const plain = useDisposable(() => new THREE.BoxGeometry(1, 1, 1), []);
  const headMat = useDisposable(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color("#b00020").multiplyScalar(1.3), toneMapped: false }),
    [],
  );

  const scatter = useMemo(
    () =>
      CLIPS.map((_, i) => {
        const a = i * 2.39996;
        return new THREE.Vector3(Math.cos(a) * 1.4, Math.sin(a * 1.3) * 1.1, -1.4 - (i % 3) * 0.6);
      }),
    [],
  );

  const W = 3.2;
  const x0 = -W / 2;
  const trackY = [0.5, 0.02, -0.5];
  const trackH = [0.34, 0.34, 0.22];

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    build.current += ((on ? 1 : 0) - build.current) * (1 - Math.exp(-dt * (reduced ? 30 : 1.6)));
    const b = build.current;
    CLIPS.forEach(([track, start, len], i) => {
      const m = clips.current[i];
      if (!m) return;
      const k = easeInOut(clamp01(b * 1.5 - i * 0.055));
      const tx = x0 + start + len / 2;
      const ty = trackY[track];
      const s = scatter[i];
      m.position.set(THREE.MathUtils.lerp(tx + s.x, tx, k), THREE.MathUtils.lerp(ty + s.y, ty, k), THREE.MathUtils.lerp(s.z, 0, k));
      m.rotation.set((1 - k) * 0.8, (1 - k) * -0.6, (1 - k) * 0.3);
      m.scale.set(len - 0.03, trackH[track], 0.07);
    });
    if (head.current) {
      const p = reduced ? 0.42 : (t * 0.16) % 1;
      head.current.position.x = x0 + p * W;
      head.current.visible = b > 0.6;
    }
    if (root.current && !reduced) root.current.rotation.y = -0.42 + Math.sin(t * 0.3) * 0.08;
  });

  return (
    <group ref={root} rotation={[-0.32, -0.42, 0]} position={[0, -0.05, 0]}>
      {CLIPS.map(([track], i) => (
        <mesh
          key={i}
          ref={(el) => {
            clips.current[i] = el;
          }}
          geometry={box}
          material={i === 5 ? materials.signature : track === 2 ? materials.barrel : materials.body}
        />
      ))}
      {/* ruler */}
      {Array.from({ length: 33 }).map((_, i) => (
        <mesh
          key={i}
          geometry={plain}
          material={materials.anodised}
          position={[x0 + (i / 32) * W, 0.86, 0]}
          scale={[0.008, i % 4 === 0 ? 0.09 : 0.045, 0.008]}
        />
      ))}
      <group ref={head}>
        <mesh geometry={plain} material={headMat} scale={[0.006, 1.7, 0.006]} position={[0, 0.02, 0.06]} />
        <mesh geometry={plain} material={headMat} scale={[0.05, 0.05, 0.006]} position={[0, 0.9, 0.06]} rotation-z={Math.PI / 4} />
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 04 EVENT COVERAGE — prints of a night, held still by a flash
// ---------------------------------------------------------------------------

export function EventVisual({ materials, on, reduced }: VisualProps) {
  const cards = useRef<(THREE.Group | null)[]>([]);
  const flash = useRef<THREE.PointLight>(null);
  const spread = useRef(0);
  const N = 7;
  const geo = useDisposable(() => new THREE.BoxGeometry(1.1, 0.756, 0.01), []);
  const plane = useDisposable(() => new THREE.PlaneGeometry(1.1, 0.756), []);
  const mats = useMemo(
    () =>
      Array.from({ length: N }).map(
        (_, i) => new THREE.MeshPhysicalMaterial({ map: eventPrint(i + 1), roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.3 }),
      ),
    [],
  );
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats]);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    spread.current += ((on ? 1 : 0) - spread.current) * (1 - Math.exp(-dt * (reduced ? 30 : 1.8)));
    const s = easeInOut(clamp01(spread.current));
    cards.current.forEach((c, i) => {
      if (!c) return;
      const k = i - (N - 1) / 2;
      const breathe = reduced ? 0 : Math.sin(t * 0.5 + i) * 0.015;
      c.position.set(k * 0.3 * s, -Math.abs(k) * 0.05 * s + breathe, -Math.abs(k) * 0.12 * s + i * 0.004);
      c.rotation.set(0.05, -k * 0.16 * s, -k * 0.08 * s);
    });
    // the flash that preserves the moment
    const cycle = reduced ? 1 : (t % 3.6) / 3.6;
    if (flash.current) flash.current.intensity = cycle < 0.06 && on ? (1 - cycle / 0.06) * 14 : 0;
  });

  return (
    <group rotation={[-0.08, 0, 0]} position={[0, 0.05, 0.2]} scale={1.15}>
      {mats.map((m, i) => (
        <group
          key={i}
          ref={(el) => {
            cards.current[i] = el;
          }}
        >
          <mesh geometry={geo} material={materials.body} />
          <mesh geometry={plane} material={m} position-z={0.0055} />
        </group>
      ))}
      <pointLight ref={flash} position={[0.3, 0.8, 2.2]} color="#ffffff" decay={2} intensity={0} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// 05 WEB — a browser frame whose layers separate in space
// ---------------------------------------------------------------------------

export function WebVisual({ materials, reduced }: VisualProps) {
  const root = useRef<THREE.Group>(null);
  const layers = useRef<(THREE.Group | null)[]>([]);
  const frame = useDisposable(() => roundedBox(2.8, 1.8, 0.05, 0.04, 3), []);
  const box = useDisposable(() => roundedBox(1, 1, 1, 0.02, 2), []);
  const plane = useDisposable(() => new THREE.PlaneGeometry(1, 1), []);
  const dot = useDisposable(() => new THREE.CircleGeometry(0.024, 24), []);
  const heroMat = useDisposable(() => new THREE.MeshBasicMaterial({ map: webHero(), color: "#bdbdbd" }), []);
  const lineMat = useDisposable(() => new THREE.MeshStandardMaterial({ color: "#8f8f8f", roughness: 0.6 }), []);
  const cardMat = useDisposable(
    () => new THREE.MeshPhysicalMaterial({ color: "#121213", roughness: 0.35, clearcoat: 0.6, metalness: 0.2 }),
    [],
  );

  useFrame(({ clock }) => {
    const t = reduced ? 0.8 : clock.elapsedTime;
    if (root.current) {
      root.current.rotation.set(0.1 + Math.sin(t * 0.22) * 0.04, -0.5 + Math.sin(t * 0.26) * 0.16, 0);
    }
    const e = 0.72 + Math.sin(t * 0.55) * 0.28;
    layers.current.forEach((l, i) => {
      if (l) l.position.z = 0.06 + (i + 1) * 0.2 * e;
    });
  });

  return (
    <group ref={root} position={[0, 0.02, 0]}>
      <mesh geometry={frame} material={materials.body} />
      <mesh geometry={plane} material={materials.screen} scale={[2.72, 1.6, 1]} position={[0, -0.06, 0.0255]} />
      <mesh geometry={plane} material={materials.barrel} scale={[2.72, 0.13, 1]} position={[0, 0.8, 0.0256]} />
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          geometry={dot}
          material={i === 0 ? materials.signature : materials.anodised}
          position={[-1.26 + i * 0.075, 0.8, 0.027]}
        />
      ))}
      <group
        ref={(el) => {
          layers.current[0] = el;
        }}
      >
        <mesh geometry={plane} material={heroMat} scale={[2.3, 0.67, 1]} position={[0, 0.28, 0]} />
      </group>
      <group
        ref={(el) => {
          layers.current[1] = el;
        }}
      >
        {[1.25, 0.95, 1.1].map((w, i) => (
          <mesh key={i} geometry={box} material={lineMat} scale={[w, 0.045, 0.012]} position={[-1.15 + w / 2, -0.2 - i * 0.1, 0]} />
        ))}
        <mesh geometry={box} material={materials.signature} scale={[0.5, 0.13, 0.04]} position={[-0.9, -0.58, 0.01]} />
      </group>
      <group
        ref={(el) => {
          layers.current[2] = el;
        }}
      >
        {[0, 1].map((i) => (
          <mesh key={i} geometry={box} material={cardMat} scale={[0.5, 0.42, 0.03]} position={[0.42 + i * 0.58, -0.38, 0]} />
        ))}
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 06 APPS — a phone, the experience in hand
// ---------------------------------------------------------------------------

export function AppsVisual({ materials, reduced }: VisualProps) {
  const root = useRef<THREE.Group>(null);
  const body = useDisposable(() => roundedBox(0.8, 1.64, 0.085, 0.1, 6), []);
  const glassShape = useDisposable(() => {
    const w = 0.76;
    const h = 1.6;
    const r = 0.085;
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const g = new THREE.ShapeGeometry(s, 12);
    // planar UVs 0..1
    const pos = g.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = pos.getX(i) / w + 0.5;
      uv[i * 2 + 1] = pos.getY(i) / h + 0.5;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    return g;
  }, []);
  const screenMat = useDisposable(() => new THREE.MeshBasicMaterial({ map: appScreen() }), []);
  const bump = useDisposable(() => roundedBox(0.3, 0.3, 0.03, 0.06, 3), []);
  const lensGeo = useDisposable(() => new THREE.CylinderGeometry(0.055, 0.055, 0.02, 32), []);
  const btn = useDisposable(() => roundedBox(0.012, 0.16, 0.03, 0.005, 2), []);

  useFrame(({ clock }) => {
    const t = reduced ? 0.6 : clock.elapsedTime;
    if (root.current) {
      root.current.rotation.set(0.08 + Math.sin(t * 0.3) * 0.05, -0.35 + Math.sin(t * 0.34) * 0.5, 0.05);
      root.current.position.y = Math.sin(t * 0.6) * 0.04;
    }
  });

  return (
    <group ref={root} scale={1.45}>
      <mesh geometry={body} material={materials.anodised} />
      <mesh geometry={glassShape} material={materials.screen} position-z={0.0428} />
      <mesh geometry={glassShape} material={screenMat} position-z={0.0432} scale={0.965} />
      <mesh geometry={btn} material={materials.anodised} position={[0.402, 0.3, 0]} />
      <mesh geometry={btn} material={materials.anodised} position={[-0.402, 0.4, 0]} scale={[1, 0.6, 1]} />
      <mesh geometry={btn} material={materials.anodised} position={[-0.402, 0.2, 0]} scale={[1, 0.6, 1]} />
      <group position={[-0.2, 0.6, -0.055]}>
        <mesh geometry={bump} material={materials.body} />
        {[
          [-0.06, 0.06],
          [0.06, -0.06],
        ].map(([x, y], i) => (
          <mesh key={i} geometry={lensGeo} material={materials.screen} position={[x, y, -0.02]} rotation-x={Math.PI / 2} />
        ))}
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 07 MOTION — the identity starts to move
// ---------------------------------------------------------------------------

export function MotionVisual({ materials, quality, on, reduced }: VisualProps) {
  const letters = useRef<(THREE.Mesh | null)[]>([]);
  const dotRef = useRef<THREE.Mesh>(null);
  const start = useRef(0);
  const s = useDisposable(() => sLetter(1.05, 0.2, quality), [quality]);
  const o = useDisposable(() => oLetter(1.05, 0.2, quality), [quality]);
  const dotGeo = useDisposable(() => new THREE.SphereGeometry(0.055, 24, 16), []);
  const dotMat = useDisposable(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color("#b00020").multiplyScalar(2), toneMapped: false }),
    [],
  );

  useEffect(() => {
    if (on) start.current = performance.now() / 1000;
  }, [on]);

  const gap = 0.14;
  const sw = 1.05 * 0.57;
  const xs = [-(1.05 / 2 + gap + sw / 2), 0, 1.05 / 2 + gap + sw / 2];

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const local = performance.now() / 1000 - start.current;
    const cycle = (local % 4.2) / 4.2;
    letters.current.forEach((l, i) => {
      if (!l) return;
      const w = clamp01((cycle - i * 0.1) / 0.4);
      const flip = reduced ? 0 : easeInOut(w) * Math.PI * 2;
      l.rotation.set(0, flip + (reduced ? 0 : Math.sin(t * 0.8 + i) * 0.08), 0);
      l.position.set(xs[i], reduced ? 0 : Math.sin(t * 1.1 + i * 0.9) * 0.035, 0);
    });
    if (dotRef.current) {
      const pulse = reduced ? 1 : 1 + Math.sin(t * 2.4) * 0.18;
      dotRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group rotation={[0.04, -0.28, 0]} position={[0, 0.02, 0]} scale={0.95}>
      {[s, o, s].map((g, i) => (
        <mesh
          key={i}
          ref={(el) => {
            letters.current[i] = el;
          }}
          geometry={g}
          material={materials.letter}
        />
      ))}
      <mesh ref={dotRef} geometry={dotGeo} material={dotMat} />
      <spotLight position={[-1.6, 2.2, 3.2]} angle={0.55} penumbra={1} decay={2} intensity={26} color="#f1e9e4" />
      <pointLight position={[1.8, -0.4, 1.4]} decay={2} intensity={5} color="#b00020" />
    </group>
  );
}
