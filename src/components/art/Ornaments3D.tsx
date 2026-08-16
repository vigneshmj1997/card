import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import "./Ornaments3D.css";

/**
 * Dimensional SVG ornaments.
 *
 * These are drawn with real form rather than flat silhouettes: a fixed
 * light direction (upper-left), a lit face, a shaded face and a cast
 * ground shadow, so each one reads as a solid object. They are then
 * placed in CSS 3D space and rotated, so the depth is not just painted —
 * the whole object turns.
 *
 * Every one is decorative and hidden from the accessibility tree.
 */

/* ------------------------------------------------------------------
   Motion wrappers
   ------------------------------------------------------------------ */

/**
 * Rocks a child back and forth about the Y axis in CSS 3D space.
 *
 * Deliberately bounded rather than a full 360° spin: these are painted
 * solids, not real geometry, so rotating one past ~45° foreshortens it
 * into a sliver instead of showing its far side. Staying inside a narrow
 * arc keeps the object legible at every frame while still moving it in
 * real 3D space.
 *
 * Halts entirely under reduced motion — a permanently moving object in
 * the corner of the eye is exactly what that setting is for.
 */
export function Sway3D({
  children,
  duration = 7,
  range = 24,
  tilt = 0,
  className,
}: {
  children: React.ReactNode;
  /** Seconds for one full there-and-back cycle. */
  duration?: number;
  /** Degrees either side of centre. */
  range?: number;
  /** Fixed backward lean, for objects drawn as if seen from above. */
  tilt?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div className={`spin3d ${className ?? ""}`} aria-hidden="true">
      <motion.div
        className="spin3d__inner"
        style={{ rotateX: tilt }}
        animate={reduced ? undefined : { rotateY: [-range, range, -range] }}
        transition={
          reduced
            ? undefined
            : { duration, ease: "easeInOut", repeat: Infinity }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Tilts a child in 3D as it passes through the viewport, so the object
 * turns in response to scrolling rather than on a timer.
 */
export function ScrollTilt3D({
  children,
  className,
  range = 55,
}: {
  children: React.ReactNode;
  className?: string;
  /** Total degrees of Y rotation across the scroll pass. */
  range?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateY = useTransform(scrollYProgress, [0, 1], [-range, range]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [14, 0, -14]);

  return (
    <div ref={ref} className={`spin3d ${className ?? ""}`} aria-hidden="true">
      <motion.div
        className="spin3d__inner"
        style={reduced ? undefined : { rotateY, rotateX }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Swings a child like a pendulum — rotation about Z, hinged near the top
 * of the box rather than its centre, so a hanging object pivots from the
 * point it is actually hung by.
 *
 * The small counter-rotation on Y keeps it from reading as a flat cutout
 * wiped side to side: the object turns slightly into each swing, which is
 * what a real bell on a chain does.
 */
export function Pendulum3D({
  children,
  duration = 5,
  range = 9,
  className,
}: {
  children: React.ReactNode;
  /** Seconds for one full there-and-back swing. */
  duration?: number;
  /** Degrees either side of hanging straight down. */
  range?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div className={`spin3d spin3d--hang ${className ?? ""}`} aria-hidden="true">
      <motion.div
        className="spin3d__inner"
        animate={
          reduced
            ? undefined
            : {
                rotateZ: [-range, range, -range],
                rotateY: [range * 0.7, -range * 0.7, range * 0.7],
              }
        }
        transition={
          reduced
            ? undefined
            : { duration, ease: "easeInOut", repeat: Infinity }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Purna Kumbham — the brass pot of water topped with mango leaves and a
   coconut, set at the entrance of every South Indian ceremony.
   ------------------------------------------------------------------ */

export function PurnaKumbham({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 220" fill="none" aria-hidden="true">
      <defs>
        {/* Brass, lit from the upper left. The three stops give the
            highlight, the body tone and the turn into shadow. */}
        <linearGradient id="kumbham-brass" x1="0.1" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor="#F2D08A" />
          <stop offset="34%" stopColor="#D9A520" />
          <stop offset="72%" stopColor="#9A6A06" />
          <stop offset="100%" stopColor="#6E4A08" />
        </linearGradient>
        <linearGradient id="kumbham-neck" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E8C168" />
          <stop offset="45%" stopColor="#C08F14" />
          <stop offset="100%" stopColor="#7B5406" />
        </linearGradient>
        <radialGradient id="kumbham-coconut" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#9C7A52" />
          <stop offset="60%" stopColor="#6B4E2E" />
          <stop offset="100%" stopColor="#412D18" />
        </radialGradient>
        <linearGradient id="kumbham-leaf" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#5C9E6B" />
          <stop offset="60%" stopColor="#2E5D43" />
          <stop offset="100%" stopColor="#1B3B2A" />
        </linearGradient>
      </defs>

      {/* cast shadow on the ground */}
      <ellipse cx="80" cy="209" rx="46" ry="8" fill="#33241A" opacity="0.16" />

      {/* pot body */}
      <path
        d="M80 96c30 0 50 22 50 52 0 32-22 54-50 54s-50-22-50-54c0-30 20-52 50-52Z"
        fill="url(#kumbham-brass)"
      />
      {/* specular highlight — one soft streak, upper left */}
      <ellipse
        cx="57"
        cy="132"
        rx="11"
        ry="22"
        fill="#FFF0C4"
        opacity="0.42"
        transform="rotate(-16 57 132)"
      />
      {/* engraved bands, curved to follow the belly of the pot */}
      <g stroke="#6E4A08" strokeWidth="1.6" fill="none" opacity="0.45">
        <path d="M34 138c14 9 78 9 92 0" />
        <path d="M32 156c16 10 80 10 96 0" />
      </g>

      {/* neck and rim, drawn as ellipses so the mouth reads as an opening */}
      <path d="M56 92h48l-5 16H61l-5-16Z" fill="url(#kumbham-neck)" />
      <ellipse cx="80" cy="92" rx="24" ry="7" fill="#E8C168" />
      <ellipse cx="80" cy="92" rx="17" ry="4.5" fill="#7B5406" opacity="0.75" />

      {/* five mango leaves fanning out of the mouth */}
      <g fill="url(#kumbham-leaf)">
        <path d="M80 88c-6-14-20-22-34-22 4 15 16 25 34 26Z" />
        <path d="M80 88c6-14 20-22 34-22-4 15-16 25-34 26Z" />
        <path d="M80 84c-5-16-14-27-25-33 0 17 8 30 25 35Z" />
        <path d="M80 84c5-16 14-27 25-33 0 17-8 30-25 35Z" />
        <path d="M80 82c-2-18-2-32 0-44 2 12 2 26 0 44Z" />
      </g>

      {/* coconut, seated in the leaves */}
      <ellipse cx="80" cy="40" rx="20" ry="23" fill="url(#kumbham-coconut)" />
      <ellipse cx="73" cy="32" rx="6" ry="8" fill="#B08A5E" opacity="0.4" />
      {/* the tuft of fibre at the top */}
      <path
        d="M80 17c-3-8-1-13 0-16 1 3 3 8 0 16Z"
        fill="#8A6A44"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Mandapam — the four-pillared wedding canopy, drawn in two-point
   perspective so the near and far pillars separate in depth.
   ------------------------------------------------------------------ */

export function Mandapam({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 220" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="mandapam-lit" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C89A5E" />
          <stop offset="100%" stopColor="#A9713F" />
        </linearGradient>
        <linearGradient id="mandapam-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7A4E2D" />
          <stop offset="100%" stopColor="#5A3721" />
        </linearGradient>
        <linearGradient id="mandapam-canopy" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#7B54A8" />
          <stop offset="55%" stopColor="#4B2E72" />
          <stop offset="100%" stopColor="#2F1C4A" />
        </linearGradient>
      </defs>

      <ellipse cx="130" cy="204" rx="86" ry="10" fill="#33241A" opacity="0.14" />

      {/* platform — top face lit, front face shaded */}
      <path d="M40 176l90-20 90 20-90 20-90-20Z" fill="#C9A97A" />
      <path d="M40 176v12l90 20v-12l-90-20Z" fill="#8E7250" />
      <path d="M220 176v12l-90 20v-12l90-20Z" fill="#6E5840" />

      {/* far pillars, drawn first and darker so they sit behind */}
      <g fill="url(#mandapam-shade)">
        <path d="M76 74h11v88l-11 4V74Z" />
        <path d="M173 74h11v92l-11-4V74Z" />
      </g>

      {/* near pillars */}
      <g fill="url(#mandapam-lit)">
        <path d="M52 84h14v96l-14 6V84Z" />
        <path d="M194 84h14v102l-14-6V84Z" />
      </g>
      {/* pillar capitals */}
      <g fill="#8A5A2B">
        <path d="M46 78h26l-3 8H49l-3-8Z" />
        <path d="M188 78h26l-3 8h-20l-3-8Z" />
        <path d="M71 68h21l-2 7H73l-2-7Z" />
        <path d="M168 68h21l-2 7h-17l-2-7Z" />
      </g>

      {/* canopy — a shallow pyramid, near face lit, far faces shaded */}
      <path d="M130 14L46 70h168L130 14Z" fill="url(#mandapam-canopy)" />
      <path d="M130 14L46 70h84V14Z" fill="#5E3A8C" opacity="0.55" />
      {/* scalloped valance hanging off the front edge */}
      <path
        d="M46 70h168v8c-12 0-12 9-24 9s-12-9-24-9-12 9-24 9-12-9-24-9-12 9-24 9-12-9-24-9-12 9-24 9v-17Z"
        fill="#3B2359"
      />
      {/* gold finial */}
      <circle cx="130" cy="12" r="6" fill="#D9A520" />
      <rect x="128" y="0" width="4" height="12" rx="2" fill="#D9A520" />

      {/* the fire, burning at the centre of the mandapam */}
      <path
        d="M130 132c8 11 12 18 12 25a12 12 0 0 1-24 0c0-7 4-14 12-25Z"
        fill="#E2861F"
        opacity="0.95"
      />
      <path
        d="M130 143c4 6 6 10 6 13a6 6 0 0 1-12 0c0-3 2-7 6-13Z"
        fill="#F2D08A"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Lotus — stacked petal rings, each ring smaller, darker and set back,
   so the flower reads as a bowl rather than a disc.
   ------------------------------------------------------------------ */

export function Lotus3D({ className }: { className?: string }) {
  /** Evenly spaced rotation angles for one ring of petals. */
  const ring = (count: number) =>
    Array.from({ length: count }, (_, i) => (i * 360) / count);

  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lotus-outer" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#F6C6DC" />
          <stop offset="55%" stopColor="#E8A0C0" />
          <stop offset="100%" stopColor="#B96C93" />
        </linearGradient>
        <linearGradient id="lotus-mid" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#F0B4CF" />
          <stop offset="60%" stopColor="#D487AC" />
          <stop offset="100%" stopColor="#9C5379" />
        </linearGradient>
        <radialGradient id="lotus-core" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#F2D08A" />
          <stop offset="70%" stopColor="#D9A520" />
          <stop offset="100%" stopColor="#9A6A06" />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="176" rx="62" ry="9" fill="#33241A" opacity="0.13" />

      {/* outer ring — widest, palest, lying nearly flat */}
      <g fill="url(#lotus-outer)">
        {ring(10).map((deg) => (
          <ellipse
            key={`o-${deg}`}
            cx="100"
            cy="62"
            rx="15"
            ry="42"
            opacity="0.92"
            transform={`rotate(${deg} 100 104)`}
          />
        ))}
      </g>

      {/* middle ring — set back and rotated off the outer ring */}
      <g fill="url(#lotus-mid)">
        {ring(8).map((deg) => (
          <ellipse
            key={`m-${deg}`}
            cx="100"
            cy="76"
            rx="12"
            ry="30"
            transform={`rotate(${deg + 22} 100 104)`}
          />
        ))}
      </g>

      {/* inner ring — smallest and most upright, closing the bowl */}
      <g fill="#C97BA3">
        {ring(6).map((deg) => (
          <ellipse
            key={`i-${deg}`}
            cx="100"
            cy="88"
            rx="9"
            ry="19"
            transform={`rotate(${deg + 12} 100 104)`}
          />
        ))}
      </g>

      {/* seed head */}
      <ellipse cx="100" cy="104" rx="15" ry="12" fill="url(#lotus-core)" />
      <g fill="#7B5406" opacity="0.55">
        <circle cx="94" cy="101" r="2" />
        <circle cx="103" cy="99" r="2" />
        <circle cx="99" cy="107" r="2" />
        <circle cx="107" cy="106" r="2" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------
   Thamboolam — the betel-leaf and gift tray handed to every guest on
   the way out. Drawn as an open box in two-point perspective.
   ------------------------------------------------------------------ */

export function GiftTray({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 190" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="tray-lit" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#E8C168" />
          <stop offset="100%" stopColor="#C08F14" />
        </linearGradient>
        <linearGradient id="tray-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9A6A06" />
          <stop offset="100%" stopColor="#6E4A08" />
        </linearGradient>
      </defs>

      <ellipse cx="110" cy="172" rx="76" ry="10" fill="#33241A" opacity="0.15" />

      {/* tray floor — the top face, seen from above and in front */}
      <path d="M110 78l84 30-84 30-84-30 84-30Z" fill="#F2D08A" />

      {/* contents, stacked before the walls so the near wall overlaps them */}
      {/* betel leaves */}
      <g>
        <path
          d="M96 104c-16-4-28 2-30 12 12 6 26 4 34-4-2-3-3-6-4-8Z"
          fill="#2E5D43"
        />
        <path
          d="M124 100c16-5 29 0 32 10-12 7-27 6-35-2 1-3 2-5 3-8Z"
          fill="#3D7355"
        />
      </g>
      {/* areca nuts */}
      <g fill="#8A5A2B">
        <circle cx="108" cy="112" r="7" />
        <circle cx="120" cy="116" r="6" />
      </g>
      {/* a small stack of coins */}
      <g>
        <ellipse cx="86" cy="118" rx="11" ry="5" fill="#D9A520" />
        <ellipse cx="86" cy="114" rx="11" ry="5" fill="#F2D08A" />
        <ellipse cx="86" cy="110" rx="11" ry="5" fill="#D9A520" />
      </g>
      {/* turmeric root and a pinch of kumkum */}
      <ellipse cx="134" cy="110" rx="9" ry="6" fill="#E2861F" transform="rotate(-18 134 110)" />
      <ellipse cx="146" cy="118" rx="7" ry="4" fill="#B22B4A" />

      {/* the four walls — near two lit, far two in shadow */}
      <path d="M26 108l84 30v22l-84-30v-22Z" fill="url(#tray-shade)" />
      <path d="M194 108l-84 30v22l84-30v-22Z" fill="url(#tray-lit)" />
      {/* rim highlight along the near edge */}
      <path d="M110 138l84-30v5l-84 30-84-30v-5l84 30Z" fill="#FFF0C4" opacity="0.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Temple bell — hung from a chain, so it is drawn as a solid of
   revolution: a lit left flank, a shaded right one, and a mouth whose
   ellipse is offset upward because the bell hangs above eye level and we
   are looking at the outside of its near wall.
   ------------------------------------------------------------------ */

export function TempleBell({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 250" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bell-body" x1="0.05" y1="0" x2="1" y2="0.25">
          <stop offset="0%" stopColor="#F2D08A" />
          <stop offset="28%" stopColor="#D9A520" />
          <stop offset="70%" stopColor="#9A6A06" />
          <stop offset="100%" stopColor="#5F3F07" />
        </linearGradient>
        <linearGradient id="bell-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E8C168" />
          <stop offset="40%" stopColor="#C08F14" />
          <stop offset="100%" stopColor="#6E4A08" />
        </linearGradient>
        <linearGradient id="bell-chain" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D9A520" />
          <stop offset="100%" stopColor="#7B5406" />
        </linearGradient>
      </defs>

      {/* chain, running up out of the frame */}
      <g stroke="url(#bell-chain)" strokeWidth="4" fill="none">
        <ellipse cx="70" cy="8" rx="7" ry="9" />
        <ellipse cx="70" cy="24" rx="7" ry="9" />
        <ellipse cx="70" cy="40" rx="7" ry="9" />
      </g>

      {/* crown loop and the mount it is bolted to */}
      <path
        d="M70 48c-11 0-19 8-19 18h9c0-6 4-10 10-10s10 4 10 10h9c0-10-8-18-19-18Z"
        fill="url(#bell-rim)"
      />
      <ellipse cx="70" cy="72" rx="17" ry="6" fill="#C08F14" />

      {/* body — one solid of revolution, flaring to the mouth */}
      <path
        d="M52 74c-4 40-18 74-22 96a48 11 0 0 0 80 0c-4-22-18-56-22-96a20 7 0 0 0-36 0Z"
        fill="url(#bell-body)"
      />
      {/* specular streak down the lit flank */}
      <path
        d="M46 92c-3 30-11 54-13 72 3 2 7 3 10 3 1-22 6-50 10-75-2 0-5 0-7 0Z"
        fill="#FFF0C4"
        opacity="0.34"
      />
      {/* engraved bands, bowed to follow the curve of the body */}
      <g stroke="#6E4A08" strokeWidth="1.6" fill="none" opacity="0.4">
        <path d="M40 130c18 7 42 7 60 0" />
        <path d="M34 152c22 8 50 8 72 0" />
      </g>
      {/* Petal band above the rim. Kept inside the silhouette: the body is
          only ~76 wide at this height, so the band has to be narrower than
          the mouth it sits above. */}
      <g fill="#7B5406" opacity="0.35">
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx={38 + i * 16} cy={155 - Math.abs(2 - i) * 1.4} rx="5" ry="7" />
        ))}
      </g>

      {/* mouth — outer rim, then the hollow set slightly high so the near
          wall of the bell stays visible beneath it */}
      <ellipse cx="70" cy="170" rx="48" ry="11" fill="url(#bell-rim)" />
      <ellipse cx="70" cy="167" rx="40" ry="8" fill="#3E2B0B" />
      <ellipse cx="70" cy="165" rx="40" ry="7" fill="#5C400F" opacity="0.7" />

      {/* clapper, hanging out of the mouth */}
      <rect x="68" y="160" width="4" height="18" rx="2" fill="#8A6A2B" />
      <circle cx="70" cy="182" r="8" fill="#A87F22" />
      <circle cx="67" cy="179" r="3" fill="#F2D08A" opacity="0.55" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Maalai — the marigold garland the couple exchange. A ring of beads
   rather than a drawn circle: each flower is shaded from the same
   upper-left light, and the flowers on the far side of the ring are
   painted first and knocked back, so the ring holds its depth when the
   whole thing is tilted and turned in CSS 3D.
   ------------------------------------------------------------------ */

export function Garland3D({ className }: { className?: string }) {
  const COUNT = 22;
  const RADIUS = 66;

  const beads = Array.from({ length: COUNT }, (_, i) => {
    const t = (i / COUNT) * Math.PI * 2;
    // 0 at the top of the ring (the far side once tilted), 1 at the near.
    const depth = (Math.sin(t) + 1) / 2;
    return {
      i,
      x: 100 + Math.cos(t) * RADIUS,
      y: 100 + Math.sin(t) * RADIUS,
      marigold: i % 2 === 0,
      depth,
    };
  }).sort((a, b) => a.depth - b.depth);

  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="maalai-marigold" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#FFC773" />
          <stop offset="45%" stopColor="#E2861F" />
          <stop offset="100%" stopColor="#8F4C0A" />
        </radialGradient>
        <radialGradient id="maalai-bud" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#FFFCF2" />
          <stop offset="50%" stopColor="#F0E2BE" />
          <stop offset="100%" stopColor="#A8926A" />
        </radialGradient>
      </defs>

      {/* the thread, visible only where the flowers leave a gap */}
      <circle
        cx="100"
        cy="100"
        r={RADIUS}
        stroke="#2E5D43"
        strokeWidth="3"
        fill="none"
        opacity="0.55"
      />

      {beads.map((b) => (
        <g key={b.i}>
          <circle
            cx={b.x}
            cy={b.y}
            r={b.marigold ? 14 : 9}
            fill={b.marigold ? "url(#maalai-marigold)" : "url(#maalai-bud)"}
          />
          {/* Aerial knock-back on the far half — the same trick the ridges
              in the hero use, at ornament scale. */}
          <circle
            cx={b.x}
            cy={b.y}
            r={b.marigold ? 14 : 9}
            fill="#3A2A1C"
            opacity={0.22 * (1 - b.depth)}
          />
        </g>
      ))}

      {/* the two tails that hang off the knot at the near point */}
      <g>
        {[0, 1, 2].map((n) => (
          <circle
            key={`l-${n}`}
            cx={90 - n * 2}
            cy={172 + n * 15}
            r={9 - n}
            fill="url(#maalai-marigold)"
          />
        ))}
        {[0, 1].map((n) => (
          <circle
            key={`r-${n}`}
            cx={112 + n * 3}
            cy={170 + n * 14}
            r={8 - n}
            fill="url(#maalai-bud)"
          />
        ))}
      </g>
    </svg>
  );
}
