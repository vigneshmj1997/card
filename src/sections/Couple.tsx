import { Suspense, lazy, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { couple, type Person } from "../data/wedding";
import { KolamCorner, Marigold } from "../components/art/Ornaments";
import { SectionHeading } from "../components/SectionHeading";
import { Garland3D, Sway3D } from "../components/art/Ornaments3D";
import { asset } from "../lib/asset";
import "./Couple.css";

// Same split as the hero: three.js is a chunk of its own, so the portraits
// and the copy are on screen long before WebGL is.
const LampScene = lazy(() =>
  import("../components/three/LampScene").then((m) => ({
    default: m.LampScene,
  })),
);

/**
 * Portrait cards that tilt in 3D toward the pointer.
 *
 * The tilt is pointer-only decoration: it never gates information, it is
 * skipped entirely under reduced motion, and the card stays a plain
 * static panel for keyboard and touch users.
 */

const MAX_TILT = 9; // degrees — past ~12 the text starts to smear

function PortraitCard({ person, delay }: { person: Person; delay: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [imageFailed, setImageFailed] = useState(false);

  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Springs keep the card from snapping when the pointer jumps or leaves.
  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]), spring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]), spring);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    // Coarse pointers have no hover; tilting on touch just fights the scroll.
    if (prefersReduced || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <motion.article
      className="portrait"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        ref={cardRef}
        className="portrait__card"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={prefersReduced ? undefined : { rotateX, rotateY }}
      >
        <div className="portrait__frame">
          <KolamCorner className="portrait__corner portrait__corner--tl" />
          <KolamCorner className="portrait__corner portrait__corner--tr" />
          <KolamCorner className="portrait__corner portrait__corner--bl" />
          <KolamCorner className="portrait__corner portrait__corner--br" />

          <div className="portrait__media">
            {imageFailed ? (
              /* No photo dropped in yet — show the illustrated stand-in
                 rather than a broken image icon. */
              <IllustratedPortrait name={person.firstName} />
            ) : (
              <img
                className="portrait__image"
                src={asset(person.portrait)}
                alt={person.portraitAlt}
                width={520}
                height={650}
                loading="lazy"
                decoding="async"
                onError={() => setImageFailed(true)}
              />
            )}
          </div>

          {/* Lifted above the card plane so the tilt reads as real depth. */}
          <Marigold className="portrait__flower" />
        </div>
      </motion.div>

      <div className="portrait__meta">
        <h3 className="script portrait__name">{person.fullName}</h3>
        <p className="portrait__parents">{person.parents}</p>
        <p className="portrait__bio">{person.bio}</p>
      </div>
    </motion.article>
  );
}

/** Illustrated placeholder shown until a real photograph is added. */
function IllustratedPortrait({ name }: { name: string }) {
  return (
    <div className="portrait__placeholder">
      <svg viewBox="0 0 200 250" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`ph-${name}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DCEEF7" />
            <stop offset="100%" stopColor="#F3E2C7" />
          </linearGradient>
        </defs>
        <rect width="200" height="250" fill={`url(#ph-${name})`} />
        <circle cx="100" cy="96" r="38" fill="#C9A97A" opacity="0.55" />
        <path
          d="M40 250v-40c0-30 27-52 60-52s60 22 60 52v40H40Z"
          fill="#4B2E72"
          opacity="0.5"
        />
      </svg>
      <p className="portrait__placeholder-text">
        Add a photo at
        <br />
        <code>public/portraits/</code>
      </p>
    </div>
  );
}

export function Couple() {
  return (
    <section id="couple" className="couple" aria-labelledby="couple-heading">
      <div className="container">
        <SectionHeading
          id="couple-heading"
          eyebrow="Two families, one thali"
          title="The Couple"
          lead="The people you are being invited to feed, photograph, and eventually dance with."
        />

        {/* The maalai, hung between the two of them. Laid well back so it
            turns like a garland on a stand rather than a coin on edge. */}
        <Sway3D className="couple__garland" duration={12} range={26} tilt={46}>
          <Garland3D />
        </Sway3D>

        <div className="couple__grid">
          <PortraitCard person={couple.bride} delay={0} />
          <PortraitCard person={couple.groom} delay={0.12} />
        </div>

        {/* One lamp, lit between the two families. The height is reserved
            in CSS, so the lazy chunk arriving never shifts the page. */}
        <div className="couple__lamp">
          <Suspense fallback={null}>
            <LampScene />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
