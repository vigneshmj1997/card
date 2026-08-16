/**
 * Hand-authored SVG ornaments.
 *
 * All art on this site is drawn in code — no raster assets, no external
 * requests, crisp at any zoom, and themeable through `currentColor`.
 * Decorative pieces are hidden from the a11y tree; the meaningful ones
 * take a `title` and expose it via <title>.
 */

interface OrnamentProps {
  className?: string;
  /** Pass a title to make the mark meaningful to screen readers. */
  title?: string;
}

/* ------------------------------------------------------------------
   Kolam — the rice-flour threshold pattern drawn outside South Indian
   homes at dawn. Used here as section dividers and card borders.
   ------------------------------------------------------------------ */

export function KolamDivider({ className, title }: OrnamentProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 40"
      fill="none"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : "true"}
      preserveAspectRatio="xMidYMid meet"
    >
      {title && <title>{title}</title>}
      <g
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.85"
      >
        <path d="M0 20h150" />
        <path d="M250 20h150" />
        {/* central lotus knot */}
        <path d="M200 6c-8 6-8 22 0 28 8-6 8-22 0-28Z" />
        <path d="M186 20c6-8 22-8 28 0-6 8-22 8-28 0Z" />
        <circle cx="200" cy="20" r="3.5" />
        {/* flanking dots — the pulli grid a kolam is built on */}
        <circle cx="168" cy="20" r="1.75" fill="currentColor" stroke="none" />
        <circle cx="232" cy="20" r="1.75" fill="currentColor" stroke="none" />
        <circle cx="156" cy="20" r="1.25" fill="currentColor" stroke="none" />
        <circle cx="244" cy="20" r="1.25" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** Corner flourish for portrait frames — a quarter kolam. */
export function KolamCorner({ className }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M4 60V26C4 14 14 4 26 4h34" />
        <path d="M12 60V28c0-9 7-16 16-16h32" />
        <path d="M20 24a8 8 0 0 1 8-8" />
        <circle cx="20" cy="24" r="2.5" fill="currentColor" stroke="none" />
        <circle cx="34" cy="12" r="1.75" fill="currentColor" stroke="none" />
        <circle cx="12" cy="38" r="1.75" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------
   Gopuram — the tiered temple tower of a Dravidian temple.
   Silhouette only; detail is carried by the tier lines.
   ------------------------------------------------------------------ */

export function Gopuram({ className }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 200 260" fill="none" aria-hidden="true">
      {/* body — narrows as it rises, like a real gopuram */}
      <path
        d="M28 260V150l14-30h116l14 30v110H28Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M46 120V96l10-20h88l10 20v24H46Z" fill="currentColor" opacity="0.95" />
      <path d="M62 76V58l8-16h60l8 16v18H62Z" fill="currentColor" />
      {/* barrel-vaulted crown (shikhara) */}
      <path d="M78 42c0-12 10-20 22-20s22 8 22 20H78Z" fill="currentColor" />
      {/* kalasam finials along the ridge */}
      <g fill="currentColor">
        <circle cx="86" cy="18" r="3.5" />
        <circle cx="100" cy="14" r="4" />
        <circle cx="114" cy="18" r="3.5" />
        <rect x="98.5" y="4" width="3" height="10" rx="1.5" />
      </g>
      {/* tier separators, drawn in the page background to read as shadow gaps */}
      <g stroke="var(--color-background)" strokeWidth="2.5" opacity="0.45">
        <path d="M42 120h116M56 76h88M70 42h60" />
      </g>
      {/* doorway */}
      <path
        d="M86 260v-58a14 14 0 0 1 28 0v58H86Z"
        fill="var(--color-background)"
        opacity="0.55"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Botanicals
   ------------------------------------------------------------------ */

/** Banana leaf — the plate every South Indian feast is served on. */
export function BananaLeaf({ className }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 120 300" fill="none" aria-hidden="true">
      <path
        d="M60 0C28 60 6 140 6 200c0 58 26 92 54 100 28-8 54-42 54-100 0-60-22-140-54-200Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* midrib */}
      <path
        d="M60 8v288"
        stroke="var(--color-background)"
        strokeWidth="3"
        opacity="0.5"
      />
      {/* veins, fanning outward at a shallower angle toward the tip */}
      <g stroke="var(--color-background)" strokeWidth="1.5" opacity="0.32">
        <path d="M60 60 26 96M60 60l34 36" />
        <path d="M60 110 20 154M60 110l40 44" />
        <path d="M60 165 22 208M60 165l38 43" />
        <path d="M60 220 32 254M60 220l28 34" />
      </g>
    </svg>
  );
}

/** Marigold — the flower strung into every wedding garland. */
export function Marigold({ className }: OrnamentProps) {
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <g fill="currentColor">
        {petals.map((deg) => (
          <ellipse
            key={deg}
            cx="50"
            cy="24"
            rx="9"
            ry="15"
            opacity="0.75"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
        {petals.map((deg) => (
          <ellipse
            key={`inner-${deg}`}
            cx="50"
            cy="36"
            rx="7"
            ry="11"
            opacity="0.9"
            transform={`rotate(${deg + 15} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="9" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------
   Ritual marks
   ------------------------------------------------------------------ */

/** Thaali / mangalsutra — the pendant tied at the muhurtham. */
export function Thaali({ className, title }: OrnamentProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 90"
      fill="none"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : "true"}
    >
      {title && <title>{title}</title>}
      {/* the cord, hanging in a catenary */}
      <path
        d="M4 8C4 44 28 62 60 62s56-18 56-54"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* beads threaded along it */}
      <g fill="currentColor">
        <circle cx="30" cy="42" r="2.5" />
        <circle cx="44" cy="54" r="2.5" />
        <circle cx="76" cy="54" r="2.5" />
        <circle cx="90" cy="42" r="2.5" />
      </g>
      {/* pendant */}
      <path
        d="M60 58c-9 6-14 14-14 20a14 14 0 0 0 28 0c0-6-5-14-14-20Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** A single lit oil lamp — the kuthuvilakku. */
export function Lamp({ className }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 60 90" fill="none" aria-hidden="true">
      {/* flame */}
      <path
        d="M30 4c6 8 9 13 9 18a9 9 0 0 1-18 0c0-5 3-10 9-18Z"
        fill="var(--color-marigold)"
      />
      <path
        d="M30 12c2.5 4 4 7 4 9.5a4 4 0 0 1-8 0c0-2.5 1.5-5.5 4-9.5Z"
        fill="var(--color-gold-soft)"
      />
      <g fill="currentColor">
        <path d="M18 34h24l-4 8H22l-4-8Z" />
        <rect x="27" y="42" width="6" height="26" rx="2" />
        <path d="M12 78c0-6 8-10 18-10s18 4 18 10v4H12v-4Z" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------
   Scenery — layered Ghibli-style backdrops
   ------------------------------------------------------------------ */

/** Soft rounded cumulus, the kind that fills a Ghibli sky. */
export function Cloud({ className }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 240 100" fill="none" aria-hidden="true">
      <path
        d="M34 88c-17 0-30-11-30-25 0-13 10-23 24-25 2-19 18-33 38-33 15 0 28 8 35 20 5-4 11-6 18-6 16 0 29 12 31 27 15 1 26 12 26 25 0 14-13 25-30 25H34Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Rolling hills — three depth layers, back to front. */
export function Hills({ className }: OrnamentProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 320"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0 200c140-60 260-40 400 10s280 70 420 20 300-70 420-30 200 60 200 60v60H0V200Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M0 250c160-50 280-20 440 30s300 50 440 10 320-50 460-10 100 40 100 40v0H0v-70Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M0 290c180-30 320 10 500 30s340 10 500-10 340-20 440 10v0H0v-30Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Flock of birds — the tiny V-marks Ghibli scatters across a sky. */
export function Birds({ className }: OrnamentProps) {
  return (
    <svg className={className} viewBox="0 0 200 80" fill="none" aria-hidden="true">
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      >
        <path d="M10 30c5-6 9-6 13 0 4-6 8-6 13 0" />
        <path d="M62 14c4-5 7-5 10 0 3-5 6-5 10 0" />
        <path d="M104 44c6-7 10-7 15 0 5-7 9-7 14 0" />
        <path d="M152 22c4-5 7-5 10 0 3-5 6-5 10 0" />
        <path d="M78 62c3-4 6-4 8 0 3-4 5-4 8 0" />
      </g>
    </svg>
  );
}
