import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * The hero's 3D layer: a Ghibli valley at golden hour with a temple
 * gopuram on the far ridge, drifting clouds, and petals in the air.
 *
 * The camera is scrubbed by scroll (never keyed to onEnter/onLeave, which
 * snaps) and every animated value is lerped toward a target so an
 * interrupted scroll resolves smoothly instead of jumping.
 *
 * Everything here is drawn from geometry and procedural textures — the
 * scene makes no network requests and ships no binary assets.
 */

const PALETTE = {
  hillFar: "#9DC3A6",
  hillMid: "#6A9B78",
  hillNear: "#406E54",
  gopuram: "#7A4E2D",
  gopuramLit: "#A9713F",
  petal: "#E8A0C0",
  gold: "#D9A520",
  sun: "#FFD98A",
};

/* ------------------------------------------------------------------
   Procedural textures
   ------------------------------------------------------------------ */

/** A soft radial falloff used as the cloud puff sprite. */
function useCloudTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    // A long, soft tail keeps the puff edges from reading as circles.
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,252,245,0.72)");
    g.addColorStop(0.75, "rgba(255,248,236,0.22)");
    g.addColorStop(1, "rgba(255,248,236,0)");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

/* ------------------------------------------------------------------
   Terrain
   ------------------------------------------------------------------ */

interface RidgeProps {
  z: number;
  color: string;
  height: number;
  /** Horizontal offset so the ridges don't share a silhouette. */
  phase: number;
  /** Base height of the ridge — controls where the horizon sits. */
  y: number;
}

/**
 * One ridge of hills, built as a flat extruded shape rather than a
 * displaced plane — far fewer vertices for the same soft, poster-like
 * silhouette, and it reads correctly with unlit materials.
 */
function Ridge({ z, color, height, phase, y }: RidgeProps) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const width = 110;
    const segments = 72;

    shape.moveTo(-width / 2, -30);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = -width / 2 + t * width;
      // Three summed sines give a natural, non-repeating skyline.
      const y =
        Math.sin(t * Math.PI * 2 + phase) * height +
        Math.sin(t * Math.PI * 5.5 + phase * 1.7) * height * 0.35 +
        Math.sin(t * Math.PI * 11 + phase * 0.6) * height * 0.12;
      shape.lineTo(x, y);
    }

    shape.lineTo(width / 2, -30);
    shape.closePath();

    return new THREE.ShapeGeometry(shape, 1);
  }, [height, phase]);

  return (
    <mesh geometry={geometry} position={[0, y, z]}>
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------
   Gopuram — the temple tower, built from stacked tapering tiers
   ------------------------------------------------------------------ */

function TempleGopuram({ position }: { position: [number, number, number] }) {
  const tiers = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        y: i * 1.5,
        // Each tier is narrower and shorter than the one below it.
        scale: 1 - i * 0.14,
        height: 1.4 - i * 0.08,
      })),
    [],
  );

  return (
    <group position={position}>
      {/* plinth */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[4.6, 1, 3]} />
        <meshBasicMaterial color={PALETTE.gopuram} toneMapped={false} />
      </mesh>

      {tiers.map((tier, i) => (
        <mesh key={tier.y} position={[0, tier.y, 0]}>
          <boxGeometry args={[4 * tier.scale, tier.height, 2.6 * tier.scale]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? PALETTE.gopuram : PALETTE.gopuramLit}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* barrel-vaulted crown */}
      <mesh position={[0, 7.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.85, 0.85, 1.9, 12, 1, false, 0, Math.PI]} />
        <meshBasicMaterial color={PALETTE.gopuramLit} toneMapped={false} />
      </mesh>

      {/* kalasam finials along the ridge */}
      {[-0.6, 0, 0.6].map((x) => (
        <mesh key={x} position={[x, 8.3, 0]}>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshBasicMaterial color={PALETTE.gold} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------
   Clouds — clusters of soft billboards
   ------------------------------------------------------------------ */

interface CloudProps {
  position: [number, number, number];
  scale: number;
  opacity: number;
  speed: number;
  seed: number;
}

function SoftCloud({ position, scale, opacity, speed, seed }: CloudProps) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useCloudTexture();

  // A cumulus silhouette: one wide base puff with smaller ones stacked
  // above and offset, never in a straight line.
  const puffs = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: 7 }, (_, i) => ({
      x: (rand() - 0.5) * 5.5,
      y: (rand() - 0.5) * 1.1 + (i === 0 ? -0.3 : 0.35),
      z: (rand() - 0.5) * 1.4,
      size: i === 0 ? 3.6 : 1.8 + rand() * 1.7,
    }));
  }, [seed]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group || speed === 0) return;
    // Drift right, then wrap back around the far edge of the valley.
    const drift = (state.clock.elapsedTime * speed) % 60;
    group.position.x = position[0] + drift - (drift > 30 ? 60 : 0);
  });

  if (!texture) return null;

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {puffs.map((p, i) => (
        <sprite key={i} position={[p.x, p.y, p.z]} scale={[p.size, p.size, 1]}>
          <spriteMaterial
            map={texture}
            transparent
            opacity={opacity}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------
   Petals — instanced so a few hundred cost one draw call
   ------------------------------------------------------------------ */

function Petals({ count = 150, paused }: { count?: number; paused: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(() => {
    const rand = mulberry32(7);
    return Array.from({ length: count }, () => ({
      x: (rand() - 0.5) * 48,
      y: rand() * 32 - 6,
      z: (rand() - 0.5) * 26 - 2,
      speed: 0.35 + rand() * 0.5,
      drift: 0.4 + rand() * 0.9,
      spin: (rand() - 0.5) * 1.6,
      phase: rand() * Math.PI * 2,
      scale: 0.06 + rand() * 0.09,
    }));
  }, [count]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Under reduced motion we still place the petals once, so the scene
    // reads as intended — we just never advance time.
    const t = paused ? 0 : state.clock.elapsedTime;

    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      // Wrap through a 34-unit column so the fall never runs out.
      let y = (s.y - t * s.speed) % 34;
      if (y < -10) y += 34;

      dummy.position.set(
        s.x + Math.sin(t * s.drift + s.phase) * 1.6,
        y,
        s.z + Math.cos(t * s.drift * 0.7 + s.phase) * 0.8,
      );
      dummy.rotation.set(t * s.spin, t * s.spin * 0.7, s.phase);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null!, null!, count]} frustumCulled={false}>
      <circleGeometry args={[1, 6]} />
      <meshBasicMaterial
        color={PALETTE.petal}
        side={THREE.DoubleSide}
        transparent
        opacity={0.85}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------
   Camera rig — scrubbed by scroll progress
   ------------------------------------------------------------------ */

function CameraRig({
  progress,
  reduced,
}: {
  progress: React.RefObject<number>;
  reduced: boolean;
}) {
  const { camera, pointer } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const p = progress.current ?? 0;

    // Scroll pushes the camera forward and lifts it over the valley.
    const wantZ = 20 - p * 10;
    const wantY = 2.2 + p * 4;

    // A gentle parallax tilt toward the pointer — skipped under reduced
    // motion, where unrequested movement is exactly what we must avoid.
    const wantX = reduced ? 0 : pointer.x * 1.2;
    const lookY = reduced ? 1.5 : 1.5 + pointer.y * 0.45;

    // Frame-rate independent smoothing: same feel at 60fps and 144fps.
    const k = 1 - Math.pow(0.0015, delta);

    camera.position.x += (wantX - camera.position.x) * k;
    camera.position.y += (wantY - camera.position.y) * k;
    camera.position.z += (wantZ - camera.position.z) * k;

    target.set(0, lookY, -12);
    camera.lookAt(target);
  });

  return null;
}

/* ------------------------------------------------------------------
   Scene
   ------------------------------------------------------------------ */

function SceneContents({
  progress,
  reduced,
}: {
  progress: React.RefObject<number>;
  reduced: boolean;
}) {
  return (
    <>
      <CameraRig progress={progress} reduced={reduced} />

      {/* Sun, sitting just above the far ridge. */}
      <mesh position={[8, 10, -38]}>
        <circleGeometry args={[3.6, 48]} />
        <meshBasicMaterial color={PALETTE.sun} toneMapped={false} />
      </mesh>
      {/* Halo — a larger, fainter disc reads as atmospheric bloom. */}
      <mesh position={[8, 10, -38.5]}>
        <circleGeometry args={[6.5, 48]} />
        <meshBasicMaterial
          color={PALETTE.sun}
          transparent
          opacity={0.25}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Depth-sorted ridges, palest and furthest first. The horizon sits
          low so the copy in front of it lands on sky, not on hillside. */}
      <Ridge z={-32} color={PALETTE.hillFar} height={3} phase={0.4} y={-11} />
      <Ridge z={-23} color={PALETTE.hillMid} height={3.6} phase={2.1} y={-12.5} />
      <Ridge z={-14} color={PALETTE.hillNear} height={4.2} phase={3.8} y={-14} />

      {/* Set well left of the copy column so the scrim never washes it. */}
      <TempleGopuram position={[-21, -8.5, -24]} />

      {/* Three cloud banks — past four the depth cue stops improving. */}
      <SoftCloud
        position={[-14, 8, -20]}
        scale={1.1}
        opacity={0.7}
        speed={reduced ? 0 : 0.32}
        seed={11}
      />
      <SoftCloud
        position={[10, 11, -27]}
        scale={1.5}
        opacity={0.5}
        speed={reduced ? 0 : 0.2}
        seed={23}
      />
      <SoftCloud
        position={[0, 14, -33]}
        scale={1.9}
        opacity={0.34}
        speed={reduced ? 0 : 0.13}
        seed={41}
      />

      <Petals paused={reduced} />
    </>
  );
}

export function GhibliScene({
  progress,
}: {
  /** 0 → 1 scroll progress through the hero, updated outside React state. */
  progress: React.RefObject<number>;
}) {
  const reduced = useReducedMotion();

  return (
    <Canvas
      camera={{ position: [0, 2.2, 20], fov: 50, near: 0.1, far: 140 }}
      // Cap DPR at 2 — beyond that the fill cost is real but invisible.
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <SceneContents progress={progress} reduced={reduced} />
    </Canvas>
  );
}

/* ------------------------------------------------------------------
   Deterministic PRNG — keeps the scene identical across reloads and
   across StrictMode's double-render, which Math.random would not.
   ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
