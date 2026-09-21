"use client";

import { SizeGuard } from "@/components/three/SizeGuard";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SCENE_BLACK, clearColor } from "@/components/three/palette";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type { ServiceVisual } from "@/content/services";
import { createMaterials, disposeMaterials, type Quality } from "@/components/three/camera/materials";
import {
  AppsVisual,
  EditingVisual,
  EventVisual,
  MotionVisual,
  PhotographyVisual,
  VideographyVisual,
  WebVisual,
  type VisualProps,
} from "./visuals";

type Props = {
  visual: ServiceVisual;
  active: boolean;
  tier: "high" | "mid";
  reduced: boolean;
};

const VISUALS: Record<ServiceVisual, (p: VisualProps) => React.ReactNode> = {
  photography: PhotographyVisual,
  videography: VideographyVisual,
  editing: EditingVisual,
  event: EventVisual,
  web: WebVisual,
  apps: AppsVisual,
  motion: MotionVisual,
};

const ORDER = Object.keys(VISUALS) as ServiceVisual[];

/**
 * Each object waits in the dark. When its service is chosen it travels
 * forward into the light; the previous one recedes into the fog.
 */
function Slot({
  on,
  reduced,
  children,
}: {
  on: boolean;
  reduced: boolean;
  children: (presence: React.RefObject<number>) => React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const presence = useRef(on ? 1 : 0);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const target = on ? 1 : 0;
    const k = reduced ? 30 : on ? 2.6 : 4.2;
    presence.current += (target - presence.current) * (1 - Math.exp(-dt * k));
    const e = presence.current;
    g.visible = e > 0.003;
    const back = 1 - e;
    g.position.set(0, -back * 0.35, -back * 6.5);
    g.rotation.set(0, back * (on ? -0.7 : 0.7), 0);
  });
  return <group ref={group}>{children(presence)}</group>;
}

function Studio() {
  return (
    <>
      <Environment resolution={128} frames={1} background={false} environmentIntensity={0.9}>
        <Lightformer form="rect" intensity={1.4} scale={[7, 1.2, 1]} position={[0, 4.5, 1]} />
        <Lightformer form="rect" intensity={1} scale={[0.5, 5, 1]} position={[-4.5, 1, 2]} />
        <Lightformer form="rect" color="#b00020" intensity={2.4} scale={[0.9, 5, 1]} position={[4.5, 1, -1]} />
        <Lightformer form="rect" intensity={0.9} scale={[0.9, 0.12, 1]} position={[-1, 2, 5]} />
        <Lightformer form="ring" color="#8b0000" intensity={1.6} scale={1.6} position={[0, 0.5, -5]} />
      </Environment>
      <spotLight color="#b00020" position={[-3, 2.6, -2.5]} angle={0.6} penumbra={1} decay={2} intensity={55} />
      <spotLight color="#8b0000" position={[3.2, 1.2, -2]} angle={0.6} penumbra={1} decay={2} intensity={32} />
      <spotLight color="#f1e9e4" position={[-2, 4, 4]} angle={0.5} penumbra={1} decay={2} intensity={30} />
      <pointLight color="#ffffff" position={[0.5, 0.4, 4.5]} decay={2} intensity={0.9} />
    </>
  );
}

function Scene({ visual, tier, reduced }: Omit<Props, "active">) {
  const quality: Quality = tier === "high" ? "high" : "mid";
  const materials = useMemo(() => createMaterials(quality), [quality]);
  useEffect(() => () => disposeMaterials(materials), [materials]);
  const size = useThree((s) => s.size);
  // Fit the objects to the stage, whatever its shape.
  const fit = Math.min(1, Math.max(0.5, size.width / size.height / 1.05));

  return (
    <>
      <Studio />
      <group scale={fit}>
      {ORDER.map((key) => {
        const V = VISUALS[key];
        const on = key === visual;
        return (
          <Slot key={key} on={on} reduced={reduced}>
            {(presence) => <V materials={materials} quality={quality} on={on} reduced={reduced} presence={presence} />}
          </Slot>
        );
      })}
      </group>
    </>
  );
}

export default function ServicesCanvas({ visual, active, tier, reduced }: Props) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={tier === "high" ? [1, 1.75] : [1, 1.4]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 30, near: 0.1, far: 40, position: [0, 0.15, 6.6] }}
      gl={{ antialias: tier !== "high", alpha: false, stencil: false, powerPreference: "high-performance" }}
      onCreated={(state) => {
        state.gl.toneMapping = THREE.ACESFilmicToneMapping;
        if (process.env.NODE_ENV !== "production") (window as unknown as { __svc?: unknown }).__svc = state;
      }}
      aria-hidden
    >
      <color attach="background" args={[clearColor(tier === "high")]} />
      <fog attach="fog" args={[SCENE_BLACK, 6.8, 12.5]} />
      <Suspense fallback={null}>
        <Scene visual={visual} tier={tier} reduced={reduced} />
        <SizeGuard />
        {tier === "high" && (
          <EffectComposer multisampling={4} enableNormalPass={false}>
            <Bloom mipmapBlur intensity={0.35} luminanceThreshold={1} luminanceSmoothing={0.3} radius={0.7} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
