"use client";

import { SizeGuard } from "@/components/three/SizeGuard";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode, type DepthOfFieldEffect } from "postprocessing";
import { HeroScene } from "./HeroScene";
import type { Tier } from "@/lib/capabilities";
import { SCENE_BLACK, clearColor } from "@/components/three/palette";

type Props = {
  tier: Exclude<Tier, "none">;
  /** pause rendering when the hero is off screen */
  active: boolean;
  /** fixed progress (reduced motion) */
  still?: number;
  /** keep the drawing buffer for poster capture */
  capture?: boolean;
};

export default function HeroCanvas({ tier, active, still, capture }: Props) {
  const dofRef = useRef<DepthOfFieldEffect | null>(null);
  const quality = tier === "high" ? "high" : "mid";

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={quality === "high" ? [1, 1.75] : [1, 1.5]}
      frameloop={active ? "demand" : "never"}
      shadows={quality === "high" ? "percentage" : false}
      camera={{ fov: 26, near: 0.05, far: 60, position: [0, 0.4, 2] }}
      gl={{
        antialias: quality !== "high",
        alpha: false,
        stencil: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: !!capture,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
      }}
      aria-hidden
    >
      <color attach="background" args={[clearColor(quality === "high")]} />
      <fog attach="fog" args={[SCENE_BLACK, 6.5, 17]} />
      <PerformanceMonitor flipflops={2} onDecline={() => undefined}>
        <AdaptiveDpr pixelated={false} />
      </PerformanceMonitor>
      <Suspense fallback={null}>
        <HeroScene quality={quality} still={still} dofRef={dofRef} />
        <SizeGuard />
        {quality === "high" && (
          <EffectComposer multisampling={4} enableNormalPass={false}>
            <DepthOfField ref={dofRef} resolutionScale={0.8} />
            <Bloom mipmapBlur intensity={0.32} luminanceThreshold={1} luminanceSmoothing={0.3} radius={0.7} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
