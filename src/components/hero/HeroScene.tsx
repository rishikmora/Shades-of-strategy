"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";
import type { DepthOfFieldEffect } from "postprocessing";
import { CameraModel, CAMERA, type CameraRig } from "@/components/three/camera/CameraModel";
import { createMaterials, disposeMaterials, type Quality } from "@/components/three/camera/materials";
import { sLetter } from "@/components/three/camera/geometry";
import { markTexture, radialGlow } from "@/components/three/camera/textures";
import { heroState } from "@/lib/store";
import { SCENE_BLACK } from "@/components/three/palette";
import { createShot, sampleShot } from "./shots";

const RED = new THREE.Color("#b00020");
const RING_RED = new THREE.Color("#b00020").multiplyScalar(3);
const FSTOPS = [1.2, 1.4, 1.8, 2, 2.8, 4, 5.6, 8, 11];

/** Height of the lens axis above the floor. */
const AXIS_Y = -CAMERA.bodyBottom;

export type HeroSceneProps = {
  quality: Quality;
  /** Fixed progress for reduced motion / poster capture. */
  still?: number;
  dofRef?: React.RefObject<DepthOfFieldEffect | null>;
};

// ---------------------------------------------------------------------------
// Studio lighting: soft boxes for reflections, spots for the story
// ---------------------------------------------------------------------------

function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1} background={false}>
      {/* overhead soft box */}
      <Lightformer form="rect" intensity={1.4} scale={[7, 1.4, 1]} position={[0, 4.5, 0.5]} />
      {/* thin white strip, camera left */}
      <Lightformer form="rect" intensity={1.3} scale={[0.22, 5, 1]} position={[-4.5, 1.6, 1.5]} />
      {/* red strip, camera right */}
      <Lightformer form="rect" color="#b00020" intensity={3} scale={[0.2, 5, 1]} position={[4.5, 1.4, -1]} />
      {/* two small window lights in front: crisp highlights in the glass */}
      <Lightformer form="rect" intensity={1.1} scale={[0.8, 0.1, 1]} position={[-1.2, 2.2, 5]} />
      <Lightformer form="rect" intensity={0.6} scale={[0.1, 0.7, 1]} position={[1.6, 1.2, 5]} />
      {/* thin red ring light behind: rotated into the lens reflection in frame 03 */}
      <mesh position={[0, 0.6, -5.5]} scale={1.5}>
        <ringGeometry args={[0.93, 1, 96]} />
        <meshBasicMaterial color={RING_RED} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {/* low red kicker */}
      <Lightformer form="rect" color="#8b0000" intensity={2.5} scale={[6, 0.05, 1]} position={[0, -0.5, -4]} />
    </Environment>
  );
}

// ---------------------------------------------------------------------------
// Cyclorama wall: black that can turn red-black, and carry the SOS projection
// ---------------------------------------------------------------------------

const coveVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coveFragment = /* glsl */ `
  uniform float uRed;
  uniform float uMono;
  uniform float uTime;
  uniform sampler2D uMark;
  uniform vec3 uBase;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec2 p = vUv - vec2(0.5, 0.15);
    p.x *= 3.1;
    float d = length(p);

    // a deep red halo behind the subject, never a red wall
    float pool = exp(-d * d * 9.0);
    float haze = exp(-d * 2.6);
    vec3 red = vec3(0.032, 0.0, 0.0014);
    vec3 col = uBase + red * (pool * 0.85 + haze * 0.2) * uRed;

    // the SOS monogram, a faint light leak on the wall
    vec2 mUv = (vUv - vec2(0.482, 0.165)) / vec2(0.15, 0.232) + 0.5;
    float inside = step(0.0, mUv.x) * step(mUv.x, 1.0) * step(0.0, mUv.y) * step(mUv.y, 1.0);
    float mark = texture2D(uMark, mUv).r * inside;
    col += vec3(0.011, 0.0, 0.0005) * mark * uMono * (0.4 + 0.6 * pool);

    // black at the floor (no horizon) and toward the top
    col = mix(uBase, col, smoothstep(0.0, 0.1, vUv.y) * smoothstep(0.85, 0.3, vUv.y));

    // subtle dither to avoid banding in the dark gradients
    col += (hash(vUv * 1024.0 + uTime) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function Cyclorama({ uniforms }: { uniforms: Record<string, THREE.IUniform> }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coveVertex,
        fragmentShader: coveFragment,
        uniforms,
        fog: false,
      }),
    [uniforms],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh position={[0, 5.5, -4.6]} material={material}>
      <planeGeometry args={[34, 11]} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Floor: black mirror with a blurred reflection (high) or satin black (mid)
// ---------------------------------------------------------------------------

function Floor({ quality, floorRef }: { quality: Quality; floorRef: React.RefObject<THREE.Mesh | null> }) {
  return (
    <mesh ref={floorRef} rotation-x={-Math.PI / 2} position={[0, 0, 5.4]} receiveShadow>
      <planeGeometry args={[40, 20]} />
      {quality === "high" ? (
        <MeshReflectorMaterial
          resolution={1024}
          blur={[500, 140]}
          mixBlur={1}
          mixStrength={2.4}
          mixContrast={1}
          depthScale={0.9}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.3}
          color="#070707"
          metalness={0.55}
          roughness={0.85}
          mirror={0}
        />
      ) : (
        <meshStandardMaterial color="#060606" roughness={0.82} metalness={0.15} />
      )}
    </mesh>
  );
}

/** Darkens the floor toward the wall so the horizon disappears into black. */
function FloorFade() {
  const tex = useMemo(() => {
    const size = 512;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.23, "rgba(255,255,255,0)");
    g.addColorStop(0.42, "rgba(255,255,255,0.7)");
    g.addColorStop(0.6, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c);
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, 0.3]}>
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial color={SCENE_BLACK} alphaMap={tex} transparent depthWrite={false} />
    </mesh>
  );
}

function ContactBlob(props: { position: [number, number, number]; scale: [number, number] }) {
  const tex = useMemo(() => radialGlow(), []);
  return (
    <mesh rotation-x={-Math.PI / 2} position={props.position} scale={[props.scale[0], props.scale[1], 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        color="#000000"
        map={tex}
        transparent
        opacity={0.8}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-4}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// The scene + its director
// ---------------------------------------------------------------------------

export function HeroScene({ quality, still, dofRef }: HeroSceneProps) {
  const { camera, scene, size, invalidate } = useThree();
  useEffect(() => {
    heroState.invalidate = () => invalidate();
    invalidate();
    return () => {
      heroState.invalidate = () => {};
    };
  }, [invalidate]);
  useEffect(() => invalidate(), [still, invalidate]);
  const materials = useMemo(() => createMaterials(quality), [quality]);
  useEffect(() => () => disposeMaterials(materials), [materials]);

  const rig = useRef<CameraRig | null>(null);
  const onRig = useCallback((r: CameraRig) => {
    rig.current = r;
  }, []);

  const product = useRef<THREE.Group>(null);
  const letters = useRef<THREE.Group>(null);
  const sLeft = useRef<THREE.Mesh>(null);
  const sRight = useRef<THREE.Mesh>(null);
  const floor = useRef<THREE.Mesh>(null);
  const blobBody = useRef<THREE.Group>(null);

  const edge = useRef<THREE.SpotLight>(null);
  const rimL = useRef<THREE.SpotLight>(null);
  const rimR = useRef<THREE.SpotLight>(null);
  const key = useRef<THREE.SpotLight>(null);
  const sweep = useRef<THREE.SpotLight>(null);
  const fill = useRef<THREE.PointLight>(null);

  const sGeo = useMemo(() => sLetter(0.74, 0.14, quality), [quality]);
  useEffect(() => () => sGeo.dispose(), [sGeo]);

  const coveUniforms = useMemo(
    () => ({
      uRed: { value: 0 },
      uMono: { value: 0 },
      uTime: { value: 0 },
      uMark: { value: markTexture("cove", { blur: 10, dot: true, pad: 0.1 }) },
      uBase: { value: new THREE.Color(SCENE_BLACK) },
    }),
    [],
  );

  const shot = useMemo(() => createShot(), []);
  const state = useRef({ p: still ?? 0, frames: 0, fstop: "" });
  const tmp = useMemo(
    () => ({
      target: new THREE.Vector3(),
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
    }),
    [],
  );
  const hud = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") (window as unknown as { __hero?: unknown }).__hero = { scene, coveUniforms };
  }, [scene, coveUniforms]);

  // Spot light targets must live in the scene graph.
  useEffect(() => {
    const lights = [edge, rimL, rimR, key, sweep];
    const targets = lights.map(() => new THREE.Object3D());
    targets.forEach((t) => scene.add(t));
    lights.forEach((l, i) => {
      if (l.current) l.current.target = targets[i];
    });
    targets[0].position.set(0, AXIS_Y, 0.87);
    targets.slice(1).forEach((t) => t.position.set(0, AXIS_Y, 0.2));
    return () => targets.forEach((t) => scene.remove(t));
  }, [scene]);

  useFrame((frameState, delta) => {
    const s = state.current;
    const r = rig.current;
    if (!r) return;

    const goal = still ?? heroState.progress;
    // A little inertia on top of smooth scrolling gives the camera weight.
    // clamp: after an idle pause (render-on-demand) the first delta is large
    const dt = Math.min(delta, 1 / 30);
    s.p += (goal - s.p) * (1 - Math.exp(-dt * (still !== undefined ? 60 : 5.5)));
    sampleShot(s.p, shot);

    // ---- framing (portrait screens re-frame rather than crop) ----
    const aspect = size.width / size.height;
    const wide = shot.dist > 1.6;
    let dist = shot.dist;
    let shiftX = shot.shiftX;
    let shiftY = shot.shiftY;
    let fov = shot.fov;
    if (aspect < 1) {
      // keep ~2.4 units of subject width in frame on tall screens
      const fitDist = 2.4 / (2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * aspect);
      if (wide) dist = Math.max(dist * 1.15, fitDist);
      else fov *= Math.min(1.5, 0.85 / aspect);
      shiftX = 0;
      shiftY = wide ? 0.13 : 0.02;
    } else if (aspect < 1.35) {
      if (wide) dist *= 1.18;
      shiftX *= 0.6;
    }

    tmp.target.set(shot.target[0], shot.target[1], shot.target[2]);
    const ce = Math.cos(shot.el);
    tmp.pos.set(
      tmp.target.x + dist * Math.sin(shot.az) * ce,
      tmp.target.y + dist * Math.sin(shot.el),
      tmp.target.z + dist * Math.cos(shot.az) * ce,
    );
    camera.position.copy(tmp.pos);
    camera.lookAt(tmp.target);
    camera.rotateZ(shot.roll);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = fov;
    const w = size.width;
    const h = size.height;
    cam.setViewOffset(w, h, -shiftX * w, shiftY * h, w, h);
    cam.updateProjectionMatrix();

    // ---- the product ----
    if (product.current) product.current.rotation.y = shot.rotY;
    r.focus.rotation.z = shot.focusRing;
    r.setAperture(shot.aperture);
    const ex = shot.explode;
    r.lens.position.z = CAMERA.mountZ + ex * 0.92;
    r.body.position.z = -ex * 3.4;
    r.body.position.y = -ex * 0.02;
    if (blobBody.current) blobBody.current.position.z = -ex * 3.4;

    // ---- the letters: S · lens · S ----
    if (letters.current && sLeft.current && sRight.current) {
      const l = shot.letters;
      letters.current.visible = l > 0.002;
      const e = 1 - Math.pow(1 - l, 3);
      const z = THREE.MathUtils.lerp(-1.4, 1.5, e);
      const spread = 0.72 + (1 - e) * 0.55;
      sLeft.current.position.set(-spread, AXIS_Y, z);
      sRight.current.position.set(spread, AXIS_Y, z);
      sLeft.current.rotation.y = (1 - e) * 1.35;
      sRight.current.rotation.y = -(1 - e) * 1.35;
    }

    // ---- light ----
    if (edge.current) edge.current.intensity = shot.edge * 18;
    if (rimL.current) rimL.current.intensity = shot.rim * 42;
    if (rimR.current) rimR.current.intensity = shot.rim * 26;
    if (key.current) key.current.intensity = shot.key * 30;
    if (fill.current) fill.current.intensity = shot.key * 0.55;
    if (sweep.current) {
      const sx = THREE.MathUtils.lerp(-4.2, 4.2, shot.sweep);
      sweep.current.position.set(sx, 2.3, 2.2 - Math.abs(sx) * 0.15);
      sweep.current.intensity = Math.sin(Math.PI * Math.min(1, Math.max(0, shot.sweep))) * 15 + shot.red * 3;
    }

    scene.environmentIntensity = shot.env;
    scene.environmentRotation.set(0, shot.envRot, 0);

    // Glass keeps its own, stronger reflection of the same environment.
    const m = r.materials;
    if (scene.environment) {
      for (const g of [m.glass, m.innerGlass]) {
        if (g.envMap !== scene.environment) {
          g.envMap = scene.environment;
          g.needsUpdate = true;
        }
        g.envMapRotation.set(0, shot.envRot, 0);
      }
      m.glass.envMapIntensity = shot.env * 1.7 + shot.edge * 0.08;
      m.innerGlass.envMapIntensity = shot.env * 0.4;
    }
    // Light through the aperture is only seen looking down the lens axis.
    r.lens.getWorldDirection(tmp.look);
    r.lens.getWorldPosition(tmp.pos);
    const facing = tmp.look.dot(tmp.pos.sub(camera.position).normalize().negate());
    const onAxis = THREE.MathUtils.smoothstep(facing, 0.72, 0.97);
    m.glow.color.copy(RED).multiplyScalar(shot.glow * 1.35 * onAxis);
    m.afLamp.emissiveIntensity = (0.1 + shot.red * 0.6) * (1 - shot.explode);

    coveUniforms.uRed.value = shot.red;
    coveUniforms.uMono.value = shot.mono;
    coveUniforms.uTime.value = frameState.clock.elapsedTime % 10;

    if (floor.current) floor.current.visible = shot.floor > 0.02;

    // ---- depth of field: rack focus ----
    const dof = dofRef?.current;
    if (dof) {
      const d = camera.position.distanceTo(tmp.target);
      dof.target = null;
      dof.cocMaterial.focusDistance = d + shot.focus;
      dof.cocMaterial.focusRange = Math.max(0.16, d * 0.3);
      dof.bokehScale = shot.bokeh;
    }

    // ---- viewfinder readout ----
    if (!hud.current) hud.current = document.getElementById("hud-fstop");
    if (hud.current) {
      const f = 1.2 * (0.25 / (0.05 + shot.aperture * 0.2));
      const stop = FSTOPS.reduce((a, b) => (Math.abs(b - f) < Math.abs(a - f) ? b : a));
      const label = `f/${stop}`;
      if (label !== s.fstop) {
        s.fstop = label;
        hud.current.textContent = label;
      }
    }

    if (s.frames < 3 && ++s.frames === 3) heroState.ready = true;
    // Render on demand: keep drawing only while the camera is still settling.
    if (Math.abs(goal - s.p) > 0.00005 || s.frames < 3) invalidate();
  });

  return (
    <>
      <StudioEnvironment />
      <Cyclorama uniforms={coveUniforms} />
      <Floor quality={quality} floorRef={floor} />
      <FloorFade />

      <group ref={product} position-y={AXIS_Y}>
        <CameraModel quality={quality} materials={materials} onRig={onRig} />
      </group>
      <group ref={blobBody}>
        <ContactBlob position={[0, 0.001, 0.1]} scale={[2.6, 1.6]} />
      </group>

      <group ref={letters} visible={false}>
        <mesh ref={sLeft} geometry={sGeo} material={materials.letter} castShadow />
        <mesh ref={sRight} geometry={sGeo} material={materials.letter} castShadow />
      </group>

      {/* story lights */}
      <spotLight ref={edge} color={RED} position={[1.25, 0.62, 1.42]} angle={0.32} penumbra={0.85} decay={2} />
      <spotLight ref={rimL} color={RED} position={[-2.3, 1.7, -2.2]} angle={0.55} penumbra={1} decay={2} />
      <spotLight ref={rimR} color="#8b0000" position={[2.5, 1.1, -1.7]} angle={0.5} penumbra={1} decay={2} />
      <spotLight
        ref={key}
        color="#f1e9e4"
        position={[-1.9, 3.4, 2.7]}
        angle={0.5}
        penumbra={1}
        decay={2}
        castShadow={quality === "high"}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <spotLight ref={sweep} color={RED} angle={0.42} penumbra={1} decay={2} />
      <pointLight ref={fill} color="#ffffff" position={[0.2, 0.7, 3.6]} decay={2} />
    </>
  );
}
