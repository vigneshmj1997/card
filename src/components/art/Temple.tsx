import { useId } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { Thoranam } from "./Thoranam";
import "./Temple.css";

/* ------------------------------------------------------------------
   The temple at the entrance.

   A Dravidian gopuram, front on: a granite gateway storey, seven
   stucco tiers that narrow as they rise, and a barrel-vaulted crown
   carrying a row of gold kalasams. The doorway is the one moving part —
   its teak doors swing inward as the visitor scrolls, and the lamp-lit
   hall behind them is what the entrance zooms into.
   ------------------------------------------------------------------ */

const VIEW_W = 600;
const VIEW_H = 1000;
const MID = VIEW_W / 2;

/** The doorway opening, in viewBox units. */
const OPENING = { left: 255, right: 345, top: 768, bottom: 1000 };

/**
 * The doorway as fractions of the gopuram's box. The entrance measures
 * the rendered gopuram and scales these, so the zoom lands on the door
 * however large the tower is drawn.
 */
export const DOORWAY = {
  cx: (OPENING.left + OPENING.right) / 2 / VIEW_W,
  cy: (OPENING.top + OPENING.bottom) / 2 / VIEW_H,
  w: (OPENING.right - OPENING.left) / VIEW_W,
  h: (OPENING.bottom - OPENING.top) / VIEW_H,
};

/** The stucco tower: where it starts and ends, and its half-width at each. */
const TOWER = { base: 690, top: 150, baseHalf: 250, topHalf: 125 };
/** Tier heights, bottom to top — each storey a little shorter than the last. */
const TIERS = [86, 82, 78, 76, 74, 72, 72];
/** Niches across each tier's wall, bottom to top. */
const NICHES = [9, 7, 7, 5, 5, 5, 3];
/** A gopuram's stucco gods are painted, and brightly. */
const FIGURE_COLORS = ["#b8322a", "#2e7fa6", "#3b8f55", "#e0a32e", "#7a4fa3", "#d1607f"];

function halfWidthAt(y: number) {
  const t = (y - TOWER.top) / (TOWER.base - TOWER.top);
  return TOWER.topHalf + t * (TOWER.baseHalf - TOWER.topHalf);
}

/** A horizontal slice of the tower between two heights, `inset` in from its sloping edge. */
function band(bottom: number, top: number, inset = 0) {
  const b = halfWidthAt(bottom) - inset;
  const t = halfWidthAt(top) - inset;
  return `${MID - b},${bottom} ${MID + b},${bottom} ${MID + t},${top} ${MID - t},${top}`;
}

/** An opening with a round top — niches, windows, the vault's arches. */
function arch(cx: number, bottom: number, top: number, halfW: number) {
  return `M${cx - halfW} ${bottom}V${top + halfW}A${halfW} ${halfW} 0 0 1 ${cx + halfW} ${top + halfW}V${bottom}Z`;
}

/* ---------- the tower ---------- */

function Tier({ index, bottom, height }: { index: number; bottom: number; height: number }) {
  const wallTop = bottom - height * 0.5;
  const corniceTop = wallTop - height * 0.14;
  const top = bottom - height;
  const parapetH = corniceTop - top;

  const niches = NICHES[index];
  const wallHalf = halfWidthAt((bottom + wallTop) / 2) - 8;
  const slot = (wallHalf * 2) / niches;
  const nicheHalf = slot * 0.27;
  const nicheTop = wallTop + (bottom - wallTop) * 0.12;
  const nicheBottom = bottom - 3;

  const shrines = niches + 2;
  const parapetHalf = halfWidthAt(corniceTop) - 2;
  const shrineSlot = (parapetHalf * 2) / shrines;
  const shrineBase = corniceTop - parapetH * 0.5;
  const corniceHalf = halfWidthAt(corniceTop) + 3;

  return (
    <g>
      {/* the wall of this storey */}
      <polygon points={band(bottom, wallTop, 8)} fill="#dcae68" />
      {/* pilasters between the niches — none on the sloping edges */}
      {Array.from({ length: niches - 1 }, (_, k) => (
        <rect
          key={k}
          x={MID - wallHalf + (k + 1) * slot - 1.5}
          y={wallTop}
          width="3"
          height={bottom - wallTop}
          fill="#efc887"
        />
      ))}

      {/* niches, each with a painted figure; the centre one is gilded */}
      {Array.from({ length: niches }, (_, k) => {
        const cx = MID - wallHalf + slot * (k + 0.5);
        const color =
          k === Math.floor(niches / 2)
            ? "#f2c14e"
            : FIGURE_COLORS[(k + index * 2) % FIGURE_COLORS.length];
        const headR = nicheHalf * 0.42;
        const headY = nicheTop + nicheHalf + headR * 0.4;
        return (
          <g key={k}>
            <path d={arch(cx, nicheBottom, nicheTop, nicheHalf)} fill="#6e3418" />
            <circle cx={cx} cy={headY} r={headR} fill={color} />
            <path
              d={`M${cx - nicheHalf * 0.62} ${nicheBottom}L${cx - nicheHalf * 0.36} ${headY + headR}H${cx + nicheHalf * 0.36}L${cx + nicheHalf * 0.62} ${nicheBottom}Z`}
              fill={color}
            />
          </g>
        );
      })}

      {/* cornice, with the shadow it throws on the wall */}
      <polygon points={band(wallTop + 5, wallTop, 8)} fill="#5a2a10" opacity="0.35" />
      <polygon points={band(wallTop, corniceTop, -3)} fill="#a35a2c" />
      <path
        d={`M${MID - corniceHalf} ${corniceTop}H${MID + corniceHalf}`}
        stroke="#f2cf8e"
        strokeWidth="1.5"
      />

      {/* the storey above, set back, seen between the parapet shrines */}
      <polygon points={band(corniceTop, top, 14)} fill="#b9773d" />

      {/* parapet: a row of miniature shrines, domed and barrel-roofed in turn */}
      {Array.from({ length: shrines }, (_, k) => {
        const cx = MID - parapetHalf + shrineSlot * (k + 0.5);
        const domed = k % 2 === 0;
        const half = shrineSlot * (domed ? 0.34 : 0.42);
        const roofH = domed ? Math.min(half * 0.95, parapetH * 0.5) : parapetH * 0.36;
        return (
          <g key={k}>
            <rect
              x={cx - half}
              y={shrineBase}
              width={half * 2}
              height={corniceTop - shrineBase}
              fill="#e9c27e"
            />
            <path
              d={arch(cx, corniceTop, shrineBase + parapetH * 0.1, half * 0.38)}
              fill="#7a3a1a"
            />
            {domed ? (
              <path
                d={`M${cx - half} ${shrineBase}A${half} ${roofH} 0 0 1 ${cx + half} ${shrineBase}Z`}
                fill="#d4954a"
              />
            ) : (
              <rect
                x={cx - half}
                y={shrineBase - roofH}
                width={half * 2}
                height={roofH + 1}
                rx={roofH / 2}
                fill="#d4954a"
              />
            )}
            <circle cx={cx} cy={shrineBase - roofH - 1.5} r="1.8" fill="#f6d36b" />
          </g>
        );
      })}
    </g>
  );
}

function Tower({ shadeId }: { shadeId: string }) {
  // Tier positions, bottom up.
  const tiers = TIERS.reduce<{ bottom: number; height: number }[]>((acc, height) => {
    const bottom = acc.length ? acc[acc.length - 1].bottom - acc[acc.length - 1].height : TOWER.base;
    return [...acc, { bottom, height }];
  }, []);

  return (
    <g>
      {/* Drawn top-down, so each storey's parapet sits in front of the
          wall of the storey above it, as it does on the real thing. */}
      {tiers
        .map((tier, index) => <Tier key={index} index={index} {...tier} />)
        .reverse()}
      {/* Morning light from the right: shade the left flank, warm the right. */}
      <polygon points={band(TOWER.base, TOWER.top, -6)} fill={`url(#${shadeId})`} />
    </g>
  );
}

const KALASAMS = [234, 256, 278, 300, 322, 344, 366];

function Crown({ goldId, vaultId }: { goldId: string; vaultId: string }) {
  return (
    <g>
      {/* the neck the vault sits on */}
      <rect x={MID - 130} y="134" width="260" height="16" fill="#c98b45" />
      <path d={`M${MID - 134} 134H${MID + 134}`} stroke="#f2cf8e" strokeWidth="2" />

      {/* gable ends of the vault, curling outward */}
      <path d="M190 100C170 96 158 76 166 56C174 68 184 74 194 76Z" fill="#c98a3c" />
      <path d="M410 100C430 96 442 76 434 56C426 68 416 74 406 76Z" fill="#c98a3c" />

      {/* the barrel vault */}
      <path
        d="M188 134V84C188 58 208 46 234 46H366C392 46 412 58 412 84V134Z"
        fill={`url(#${vaultId})`}
      />
      <path d="M200 92H400" stroke="#a8692c" strokeWidth="1.5" opacity="0.6" />

      {/* arched windows across its face, the middle one with a seated figure */}
      <path d={arch(MID, 134, 72, 24)} fill="#5a2a12" />
      <path
        d="M270 134V102A30 30 0 0 1 330 102V134"
        stroke="#f6d27a"
        strokeWidth="3"
        fill="none"
      />
      <circle cx={MID} cy="96" r="6" fill="#f2c14e" />
      <path d="M288 134C288 114 292 104 300 104C308 104 312 114 312 134Z" fill="#f2c14e" />
      <circle cx={MID} cy="64" r="7" fill="#f2c14e" />
      <path d={arch(240, 134, 100, 13)} fill="#5a2a12" />
      <path d={arch(360, 134, 100, 13)} fill="#5a2a12" />

      {/* gilded kalasams along the ridge */}
      {KALASAMS.map((cx) => (
        <g key={cx} fill={`url(#${goldId})`}>
          <ellipse cx={cx} cy="45" rx="7" ry="2.5" />
          <path d={`M${cx - 6} 43C${cx - 9} 33 ${cx - 5} 27 ${cx} 27C${cx + 5} 27 ${cx + 9} 33 ${cx + 6} 43Z`} />
          <circle cx={cx} cy="23" r="4" />
          <path d={`M${cx - 2.5} 20L${cx} 3L${cx + 2.5} 20Z`} />
          <ellipse cx={cx - 2} cy="34" rx="1.4" ry="3" fill="#fff6d0" opacity="0.7" />
        </g>
      ))}
    </g>
  );
}

/* ---------- the gateway storey ---------- */

const PILASTERS = [52, 112, 172, 410, 470, 530];
const STONE_NICHES = [91, 151, 449, 509];

function GatewayStorey({ graniteId }: { graniteId: string }) {
  return (
    <g>
      <rect x="40" y="704" width="520" height="250" fill={`url(#${graniteId})`} />
      <g stroke="#a39073" strokeWidth="2" opacity="0.7">
        <path d="M40 742H560M40 906H560" />
      </g>
      {PILASTERS.map((x) => (
        <g key={x}>
          <rect x={x} y="710" width="18" height="240" fill="#d8c8ac" />
          <rect x={x - 3} y="710" width="24" height="10" fill="#bfae92" />
          <rect x={x - 3} y="936" width="24" height="14" fill="#bfae92" />
        </g>
      ))}
      {/* carved stone figures in the gateway niches */}
      {STONE_NICHES.map((cx) => (
        <g key={cx}>
          <path d={arch(cx, 896, 760, 15)} fill="#8b7a62" />
          <circle cx={cx} cy="786" r="6" fill="#b5a284" />
          <path d={`M${cx - 9} 892L${cx - 5} 794H${cx + 5}L${cx + 9} 892Z`} fill="#b5a284" />
        </g>
      ))}

      {/* cornice over the gateway */}
      <rect x="30" y="690" width="540" height="16" fill="#8e7c64" />
      <path d="M30 690H570" stroke="#e4d6bc" strokeWidth="2" />

      {/* plinth mouldings */}
      <rect x="30" y="950" width="540" height="12" fill="#c8b79c" />
      <rect x="34" y="962" width="532" height="24" fill="#9e8c74" />
      <rect x="30" y="986" width="540" height="14" fill="#8a7962" />
    </g>
  );
}

/* ---------- the doorway ---------- */

function Door({
  open,
  side,
  woodId,
}: {
  open: MotionValue<number>;
  side: "left" | "right";
  woodId: string;
}) {
  // Swinging inward, a door shows less and less of its face, and what
  // it does show falls into shadow.
  const scaleX = useTransform(open, [0, 1], [1, 0.12]);
  const shade = useTransform(open, [0, 1], [0, 0.6]);

  const w = (OPENING.right - OPENING.left) / 2;
  const h = OPENING.bottom - OPENING.top;
  const hinge = side === "left" ? OPENING.left : OPENING.right;

  return (
    // The right door is the left door mirrored, so both hinge at local x = 0.
    <g transform={`translate(${hinge} ${OPENING.top})${side === "right" ? " scale(-1 1)" : ""}`}>
      <motion.g style={{ scaleX, originX: 0, originY: 0.5 }}>
        <rect width={w} height={h} fill={`url(#${woodId})`} />
        <g stroke="#2e1406" strokeWidth="1.5" opacity="0.7" fill="none">
          <rect x="5" y="7" width={w - 10} height={h * 0.45} rx="2" />
          <rect x="5" y={h * 0.45 + 14} width={w - 10} height={h * 0.55 - 21} rx="2" />
        </g>
        {/* brass bosses studding the door */}
        <g fill="#e2b84f">
          {Array.from({ length: 14 }, (_, r) =>
            Array.from({ length: 4 }, (_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={9 + c * ((w - 18) / 3)}
                cy={14 + r * ((h - 28) / 13)}
                r="1.9"
              />
            )),
          )}
        </g>
        <circle cx={w - 7} cy={h * 0.5} r="4" stroke="#e8c25a" strokeWidth="1.6" fill="none" />
        <rect x={w - 1.5} width="1.5" height={h} fill="#1a0a03" />
        <motion.rect width={w} height={h} fill="#120502" style={{ opacity: shade }} />
      </motion.g>
    </g>
  );
}

/** The hall seen through the doorway: pillars receding toward the sanctum lamp. */
function Hall({ glowId }: { glowId: string }) {
  const { left, right, top, bottom } = OPENING;
  const vanish = { x: MID, y: 902 };
  const depths = [0.12, 0.34, 0.52, 0.66, 0.76];
  const towards = (from: number, to: number, f: number) => from + (to - from) * f;

  return (
    <g>
      <rect x={left} y={top} width={right - left} height={bottom - top} fill="#170804" />
      <path
        d={`M${left} ${bottom}H${right}L${vanish.x + 5} ${vanish.y}H${vanish.x - 5}Z`}
        fill="#3d1b0c"
      />
      {depths.map((f) => {
        const pillarW = 11 * (1 - f);
        const y0 = towards(top, vanish.y, f);
        const y1 = towards(bottom, vanish.y, f);
        const xl = towards(left + 3, vanish.x, f);
        const xr = towards(right - 3, vanish.x, f) - pillarW;
        return (
          <g key={f}>
            <rect x={xl} y={y0} width={pillarW} height={y1 - y0} fill="#2a1208" />
            <rect x={xl + pillarW - 1.2} y={y0} width="1.2" height={y1 - y0} fill="#d0913f" opacity="0.55" />
            <rect x={xr} y={y0} width={pillarW} height={y1 - y0} fill="#2a1208" />
            <rect x={xr} y={y0} width="1.2" height={y1 - y0} fill="#d0913f" opacity="0.55" />
          </g>
        );
      })}
      <circle cx={vanish.x} cy={vanish.y} r="48" fill={`url(#${glowId})`} />
      {/* the lamp in the sanctum, burning at the far end */}
      <path d="M300 884C303 888 304.5 891 304.5 893.5A4.5 4.5 0 0 1 295.5 893.5C295.5 891 297 888 300 884Z" fill="#ffe7a8" />
      <path d="M296 900H304L302 903H298Z" fill="#c98a3c" />
    </g>
  );
}

function Doorway({ open, ids }: { open: MotionValue<number>; ids: Record<string, string> }) {
  const { left, right, top, bottom } = OPENING;
  return (
    <g>
      {/* stepped granite frame, and the lintel across it */}
      <rect x="226" y="730" width="148" height="270" fill="#a8967c" />
      <rect x="240" y="750" width="120" height="250" fill="#c4b294" />
      <g stroke="#9c8a70" strokeWidth="1.5">
        <path d="M247 756V1000M353 756V1000" />
      </g>
      <rect x="214" y="722" width="172" height="20" fill="#8e7c64" />
      <path d="M214 722H386" stroke="#e4d6bc" strokeWidth="2" />

      <clipPath id={ids.opening}>
        <rect x={left} y={top} width={right - left} height={bottom - top} />
      </clipPath>
      <g clipPath={`url(#${ids.opening})`}>
        <Hall glowId={ids.glow} />
        <Door open={open} side="left" woodId={ids.wood} />
        <Door open={open} side="right" woodId={ids.wood} />
      </g>
      <rect x="250" y="992" width="100" height="8" fill="#8a7962" />

      {/* mango leaves strung across the lintel for the wedding */}
      <Thoranam leaves={5} x="228" y="736" width="144" height="94" />
    </g>
  );
}

/* ---------- the banana trees tied at the entrance ---------- */

function BananaTree({ x, side }: { x: number; side: "left" | "right" }) {
  // Drawn for the right side, and mirrored for the left, so the leaves
  // always arch away from the door rather than across it.
  const mirror = side === "left" ? `translate(${2 * x} 0) scale(-1 1)` : undefined;
  const leaf = "M0 0C16 -34 52 -58 92 -44C64 -36 30 -18 0 0Z";
  const rib = "M0 0C18 -28 52 -48 92 -44";
  const leaves = [
    { angle: -75, color: "#6aa33a" },
    { angle: -45, color: "#4f8a2e" },
    { angle: -15, color: "#5f9a36" },
    { angle: 18, color: "#4a8129" },
  ];
  return (
    <g transform={mirror}>
      <path d={`M${x - 8} 1000L${x - 5} 860H${x + 5}L${x + 8} 1000Z`} fill="#a3ae55" />
      <g stroke="#7c8a3a" strokeWidth="1.2" opacity="0.8">
        <path d={`M${x - 3} 995L${x - 2} 866M${x + 3} 995L${x + 2} 866`} />
      </g>
      {leaves.map(({ angle, color }) => (
        <g key={angle} transform={`translate(${x} 862) rotate(${angle})`}>
          <path d={leaf} fill={color} />
          <path d={rib} stroke="#c9dc8a" strokeWidth="1.4" opacity="0.7" />
        </g>
      ))}
      {/* the banana flower, hanging on its stalk */}
      <path d={`M${x + 2} 864C${x + 16} 870 ${x + 18} 884 ${x + 16} 896`} stroke="#6d7f30" strokeWidth="2.5" fill="none" />
      <ellipse cx={x + 16} cy="906" rx="6" ry="11" fill="#7a1f3a" />
      <ellipse cx={x + 14} cy="902" rx="1.6" ry="5" fill="#b0476a" opacity="0.7" />
    </g>
  );
}

/* ---------- the gopuram, assembled ---------- */

export function TempleGopuram({
  className,
  doorOpen,
}: {
  className?: string;
  /** 0 = doors shut, 1 = swung fully in. */
  doorOpen: MotionValue<number>;
}) {
  const uid = useId();
  const ids = {
    shade: `${uid}-shade`,
    gold: `${uid}-gold`,
    vault: `${uid}-vault`,
    granite: `${uid}-granite`,
    wood: `${uid}-wood`,
    glow: `${uid}-glow`,
    opening: `${uid}-opening`,
  };

  return (
    <svg
      className={className}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={ids.shade} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3c1400" stopOpacity="0.32" />
          <stop offset="0.45" stopColor="#3c1400" stopOpacity="0" />
          <stop offset="0.72" stopColor="#fff2d6" stopOpacity="0.12" />
          <stop offset="1" stopColor="#3c1400" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id={ids.gold} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fbe38e" />
          <stop offset="0.5" stopColor="#e0a92c" />
          <stop offset="1" stopColor="#a8740e" />
        </linearGradient>
        <linearGradient id={ids.vault} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f1c46e" />
          <stop offset="1" stopColor="#c98a3c" />
        </linearGradient>
        <linearGradient id={ids.granite} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#cdbb9e" />
          <stop offset="1" stopColor="#b3a083" />
        </linearGradient>
        <linearGradient id={ids.wood} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#4a2410" />
          <stop offset="0.55" stopColor="#7a4520" />
          <stop offset="1" stopColor="#5a2d14" />
        </linearGradient>
        <radialGradient id={ids.glow}>
          <stop offset="0" stopColor="#ffe6a6" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#ffb347" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ff9a2e" stopOpacity="0" />
        </radialGradient>
      </defs>

      <Crown goldId={ids.gold} vaultId={ids.vault} />
      <Tower shadeId={ids.shade} />
      <GatewayStorey graniteId={ids.granite} />
      <Doorway open={doorOpen} ids={ids} />
      <BananaTree x={208} side="left" />
      <BananaTree x={392} side="right" />
    </svg>
  );
}

/* ---------- around the temple ---------- */

/** The rice-flour kolam drawn on the ground before the door. */
export function ThresholdKolam({ className }: { className?: string }) {
  const petals = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <g stroke="#fffaf0" strokeWidth="2.4" strokeLinecap="round">
        {petals.map((deg) => (
          <path
            key={deg}
            d="M100 100C86 74 90 44 100 24C110 44 114 74 100 100Z"
            transform={`rotate(${deg} 100 100)`}
          />
        ))}
        {petals.map((deg) => (
          <circle key={`loop-${deg}`} cx="100" cy="36" r="7" transform={`rotate(${deg + 22.5} 100 100)`} />
        ))}
        <circle cx="100" cy="100" r="16" />
        <circle cx="100" cy="100" r="92" strokeDasharray="1 11" strokeWidth="3.5" />
      </g>
      <circle cx="100" cy="100" r="4" fill="#fffaf0" />
    </svg>
  );
}

/** A coconut palm, leaning, in silhouette. */
export function CoconutPalm({ className }: { className?: string }) {
  const frond = "M0 0C30 -14 70 -10 104 12C70 0 34 -2 0 0Z";
  return (
    <svg className={className} viewBox="0 0 240 420" fill="none" aria-hidden="true">
      <path d="M118 420C122 320 118 200 138 96L148 98C130 200 134 320 132 420Z" fill="currentColor" />
      <g fill="currentColor">
        {/* each frond drawn twice, once mirrored, so all of them droop at the tip */}
        {[-72, -40, -10, 20, 48].map((deg) => (
          <g key={deg}>
            <path d={frond} transform={`translate(143 94) rotate(${deg})`} />
            <path d={frond} transform={`translate(143 94) scale(-1 1) rotate(${deg})`} />
          </g>
        ))}
        <circle cx="140" cy="102" r="6" />
        <circle cx="149" cy="104" r="5.5" />
      </g>
    </svg>
  );
}

/**
 * A carved granite pillar for the hall: bracket capital with banana-bud
 * pendants on top, a banded shaft that stretches to any height, and a
 * stepped base.
 */
export function Pillar({ className }: { className?: string }) {
  const uid = useId();
  const stone = `${uid}-stone`;
  return (
    <div className={`pillar ${className ?? ""}`} aria-hidden="true">
      <svg className="pillar__capital" viewBox="0 0 160 150" fill="none">
        <defs>
          <linearGradient id={stone} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#4a2414" />
            <stop offset="0.55" stopColor="#9a6036" />
            <stop offset="1" stopColor="#4a2414" />
          </linearGradient>
        </defs>
        <g fill={`url(#${stone})`}>
          <rect width="160" height="16" />
          <path d="M8 16H152V34C152 46 140 50 128 50H32C20 50 8 46 8 34Z" />
          <ellipse cx="24" cy="60" rx="6" ry="11" />
          <ellipse cx="136" cy="60" rx="6" ry="11" />
          <rect x="50" y="50" width="60" height="10" />
          <path d="M40 60H120C120 84 104 96 80 96C56 96 40 84 40 60Z" />
          <rect x="46" y="96" width="68" height="10" />
          <rect x="54" y="106" width="52" height="44" />
        </g>
        <path d="M8 34H152M44 64H116" stroke="#d29a55" strokeWidth="1.5" opacity="0.5" />
      </svg>
      <div className="pillar__shaft" />
      <svg className="pillar__base" viewBox="0 0 160 90" fill="none">
        <g fill={`url(#${stone})`}>
          <rect x="54" width="52" height="22" />
          <path d="M44 22H116L128 60H32Z" />
          <rect x="20" y="60" width="120" height="30" />
        </g>
      </svg>
    </div>
  );
}
