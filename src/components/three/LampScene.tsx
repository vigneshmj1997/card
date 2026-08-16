import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * The kuthuvilakku — the five-wicked brass lamp lit at the start of a
 * South Indian ceremony — as real geometry rather than a drawing.
 *
 * The body is a lathe: the same silhouette a lamp is actually turned
 * from, revolved around its axis, so the brass catches light around its
 * whole circumference instead of only where a highlight was painted.
 * Because polished metal is nothing but reflection, the scene carries a
 * small environment map generated on a canvas at runtime — no HDRI, no
 * network request, and the lamp still reads as metal.
 *
 * Purely decorative: the canvas is hidden from assistive technology, it
 * renders only while it is on screen, and under prefers-reduced-motion it
 * settles into a single still frame.
 */

const BRASS = "#C08F14";
const FLAME_CORE = "#FFE9A8";
const FLAME_GLOW = "#FFA23A";
const WICKS = 5;

/* ------------------------------------------------------------------
   Procedural environment — a warm room in an equirectangular strip.
   ------------------------------------------------------------------ */

function useEnvironment() {
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Sky above, warm paper at the horizon, dark floor below — the same
    // top-to-bottom logic as a real room, which is what makes the brass
    // look upright rather than lit from nowhere.
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#FFF6E2");
    g.addColorStop(0.45, "#F3E3C4");
    g.addColorStop(0.55, "#C8A87A");
    g.addColorStop(1, "#4A382A");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 256);

    // The key light, sitting where the directional light is.
    const sun = ctx.createRadialGradient(140, 70, 0, 140, 70, 90);
    sun.addColorStop(0, "rgba(255,255,255,1)");
    sun.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sun;
    ctx.fillRect(50, 0, 180, 160);

    // A cool window on the far side, so the shaded flank of the lamp
    // picks up sky rather than going flat black.
    const cool = ctx.createRadialGradient(390, 90, 0, 390, 90, 110);
    cool.addColorStop(0, "rgba(207,234,247,0.85)");
    cool.addColorStop(1, "rgba(207,234,247,0)");
    ctx.fillStyle = cool;
    ctx.fillRect(280, 0, 220, 200);

    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => {
    if (!texture) return;
    scene.environment = texture;
    // Assigning to the scene imperatively is invisible to the renderer's
    // change detection — without this, a paused (reduced-motion) canvas
    // would keep showing the frame it drew before the metal had anything
    // to reflect.
    invalidate();
    return () => {
      scene.environment = null;
      // Textures are not garbage collected off the GPU — this one has to
      // be released by hand when the section unmounts.
      texture.dispose();
    };
  }, [scene, texture, invalidate]);
}

/** A soft radial falloff, reused for the flame haloes and the shadow. */
function useFalloffTexture(inner: string, outer: string) {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner);
    g.addColorStop(0.45, outer);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [inner, outer]);
}

/* ------------------------------------------------------------------
   The lamp itself
   ------------------------------------------------------------------ */

/**
 * The turned profile, in metres of lamp: base flare, waisted stem with
 * two beads, then the oil cup, which folds back on itself at the rim so
 * the bowl is genuinely hollow rather than a capped cylinder.
 */
const PROFILE: Array<[number, number]> = [
  [0.0, 0.0],
  [1.28, 0.0],
  [1.26, 0.1],
  [0.92, 0.22],
  [0.6, 0.36],
  [0.34, 0.54],
  [0.24, 0.8],
  [0.36, 0.94],
  [0.24, 1.08],
  [0.22, 1.42],
  [0.32, 1.58],
  [0.22, 1.74],
  [0.26, 1.98],
  [0.66, 2.2],
  [1.02, 2.42],
  [1.04, 2.56],
  [0.88, 2.52],
  [0.56, 2.34],
  [0.24, 2.28],
  [0.0, 2.28],
];

function Lamp({ reduced }: { reduced: boolean }) {
  const geometry = useMemo(() => {
    const points = PROFILE.map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(points, 64);
  }, []);

  const beak = useMemo(() => new THREE.ConeGeometry(0.11, 0.44, 14), []);

  useEffect(
    () => () => {
      geometry.dispose();
      beak.dispose();
    },
    [geometry, beak],
  );

  const wicks = Array.from(
    { length: WICKS },
    (_, i) => (i / WICKS) * Math.PI * 2,
  );

  return (
    <group>
      <mesh geometry={geometry} castShadow={false}>
        <meshStandardMaterial
          color={BRASS}
          metalness={0.92}
          roughness={0.26}
          envMapIntensity={1.15}
        />
      </mesh>

      {/* The five beaks the wicks lie in, and a flame over each. */}
      {wicks.map((angle, i) => (
        <group key={angle} rotation={[0, angle, 0]}>
          <mesh
            geometry={beak}
            position={[1.04, 2.46, 0]}
            rotation={[0, 0, -Math.PI / 2.9]}
          >
            <meshStandardMaterial
              color={BRASS}
              metalness={0.9}
              roughness={0.3}
              envMapIntensity={1.1}
            />
          </mesh>

          <Flame position={[1.34, 2.66, 0]} seed={i} reduced={reduced} />
        </group>
      ))}

      {/* One light for all five flames. Five real point lights would cost
          five shader iterations per fragment for a difference nobody can
          see at this size. */}
      <pointLight
        position={[0, 2.6, 0]}
        color={FLAME_GLOW}
        intensity={9}
        distance={6}
        decay={2}
      />
    </group>
  );
}

function Flame({
  position,
  seed,
  reduced,
}: {
  position: [number, number, number];
  seed: number;
  reduced: boolean;
}) {
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Sprite>(null);
  const glow = useFalloffTexture("rgba(255,214,140,0.95)", "rgba(255,150,50,0.35)");

  useEffect(() => () => glow?.dispose(), [glow]);

  useFrame(({ clock }) => {
    if (reduced || !core.current || !halo.current) return;

    // Two incommensurate frequencies per flame, offset by the wick index:
    // the flames never fall into step with each other, which a single
    // sine — or a shared clock — would give away immediately.
    const t = clock.elapsedTime;
    const f =
      1 +
      Math.sin(t * 8.5 + seed * 1.7) * 0.1 +
      Math.sin(t * 21 + seed * 3.1) * 0.045;

    core.current.scale.set(1 / f, f, 1 / f);
    halo.current.scale.setScalar(0.84 * (0.94 + (f - 1) * 1.6));
  });

  return (
    <group position={position}>
      <mesh ref={core}>
        <coneGeometry args={[0.058, 0.34, 12]} />
        <meshBasicMaterial color={FLAME_CORE} toneMapped={false} />
      </mesh>

      {glow && (
        <sprite ref={halo} scale={0.84}>
          <spriteMaterial
            map={glow}
            color={FLAME_GLOW}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------
   Marigold petals, circling the lamp
   ------------------------------------------------------------------ */

function Petals({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.17, 0.08, 0.17, 0.34, 0, 0.46);
    shape.bezierCurveTo(-0.17, 0.34, -0.17, 0.08, 0, 0);
    return new THREE.ShapeGeometry(shape, 8);
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const petals = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const t = (i / 14) * Math.PI * 2;
        const radius = 1.85 + ((i * 37) % 11) / 22;
        return {
          key: i,
          position: [
            Math.cos(t) * radius,
            0.35 + ((i * 53) % 17) / 12,
            Math.sin(t) * radius,
          ] as [number, number, number],
          rotation: [
            ((i * 29) % 13) / 6,
            -t,
            ((i * 41) % 19) / 7,
          ] as [number, number, number],
        };
      }),
    [],
  );

  useFrame((_, delta) => {
    if (reduced || !group.current) return;
    group.current.rotation.y += delta * 0.09;
  });

  return (
    <group ref={group}>
      {petals.map((p) => (
        <mesh
          key={p.key}
          geometry={geometry}
          position={p.position}
          rotation={p.rotation}
          scale={0.78}
        >
          <meshStandardMaterial
            color="#E8A0C0"
            roughness={0.85}
            metalness={0}
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------
   Contact shadow — a painted disc, not a shadow map. At this scale the
   difference is invisible and the cost is one textured quad.
   ------------------------------------------------------------------ */

function GroundShadow() {
  const tex = useFalloffTexture("rgba(51,36,26,0.5)", "rgba(51,36,26,0.16)");
  useEffect(() => () => tex?.dispose(), [tex]);

  if (!tex) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
      <planeGeometry args={[4.4, 4.4]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------
   Rig
   ------------------------------------------------------------------ */

function Stage({ reduced }: { reduced: boolean }) {
  useEnvironment();

  const group = useRef<THREE.Group>(null);
  const pointer = useThree((s) => s.pointer);

  useFrame((_, delta) => {
    if (!group.current) return;

    if (reduced) {
      // A single fixed three-quarter view: enough turn to show the lamp is
      // round, with nothing moving.
      group.current.rotation.y = 0.35;
      return;
    }

    group.current.rotation.y += delta * 0.16;
    // A shallow lean toward the pointer, smoothed frame-rate independently
    // so a fast mouse can't snap it.
    const wantX = pointer.y * 0.12;
    const k = 1 - Math.pow(0.002, delta);
    group.current.rotation.x += (wantX - group.current.rotation.x) * k;
  });

  return (
    <>
      <ambientLight intensity={0.75} color="#FFF3DC" />
      <directionalLight position={[-4, 5, 4]} intensity={2.2} color="#FFF0D2" />
      <directionalLight position={[4.5, 1.5, -3]} intensity={0.7} color="#8FC8E8" />

      {/* The lamp stands on y=0; the whole stage is dropped so the cup,
          not the base, sits at the centre of the frame. */}
      <group ref={group} position={[0, -1.35, 0]}>
        <Lamp reduced={reduced} />
        <Petals reduced={reduced} />
        <GroundShadow />
      </group>
    </>
  );
}

export function LampScene() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const holder = useRef<HTMLDivElement>(null);

  // A WebGL canvas animating off screen is pure heat. Render only while
  // the lamp is actually in view.
  useEffect(() => {
    const el = holder.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={holder} className="lamp3d" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.35, 5.7], fov: 42, near: 0.1, far: 40 }}
        dpr={[1, 2]}
        frameloop={visible && !reduced ? "always" : "demand"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
      >
        <Stage reduced={reduced} />
      </Canvas>
    </div>
  );
}
