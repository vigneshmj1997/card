import { useId, type SVGProps } from "react";
import "./Thoranam.css";

/* ------------------------------------------------------------------
   Thoranam — the string of mango leaves tied over a doorway for any
   auspicious day. Each leaf is folded over the string and hangs from
   it, with a marigold knotted between every pair. The leaves sway on
   their own timers so the string never moves in lockstep.
   ------------------------------------------------------------------ */

/** Horizontal distance between leaves, in viewBox units. */
const PITCH = 40;
const HEIGHT = 130;
/** Height of the string at its ends, and how far it sags in the middle. */
const STRING_Y = 12;
const SAG = 10;

interface ThoranamProps extends Omit<SVGProps<SVGSVGElement>, "viewBox"> {
  /** How many leaves hang from the string. */
  leaves?: number;
}

/**
 * Stable pseudo-random 0–1 per leaf. Leaves need to differ from each
 * other, but must not reshuffle on every render.
 */
function jitter(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** A mango leaf hanging from its base at (0, 0): narrow, widest just above halfway, with a long pointed tip. */
function leafPath(length: number, half: number) {
  return `M0 0C${half} ${length * 0.12} ${half * 1.1} ${length * 0.55} 0 ${length}C${-half * 1.1} ${length * 0.55} ${-half} ${length * 0.12} 0 0Z`;
}

export function Thoranam({ leaves = 11, className, ...rest }: ThoranamProps) {
  const id = useId();
  const width = leaves * PITCH;
  // A parabola, which is exactly what the quadratic curve below draws.
  const stringAt = (x: number) =>
    STRING_Y + 4 * SAG * (x / width) * (1 - x / width);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${HEIGHT}`}
      fill="none"
      // The end marigolds sit on the edge of the box; let them spill over.
      overflow="visible"
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <linearGradient id={`${id}-leaf`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#1f4f1b" />
          <stop offset="0.5" stopColor="#3d7a2b" />
          <stop offset="1" stopColor="#2b6123" />
        </linearGradient>
        {/* Every few leaves is a paler, younger one — a real thoranam is never one green. */}
        <linearGradient id={`${id}-young`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#4d7a22" />
          <stop offset="0.5" stopColor="#7fa83a" />
          <stop offset="1" stopColor="#5f8c2a" />
        </linearGradient>
      </defs>

      <path
        d={`M0 ${STRING_Y}Q${width / 2} ${STRING_Y + SAG * 2} ${width} ${STRING_Y}`}
        stroke="#7a4a20"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {Array.from({ length: leaves }, (_, i) => {
        const x = PITCH / 2 + i * PITCH;
        const length = 86 + jitter(i, 1) * 22;
        const half = 11 + jitter(i, 2) * 3;
        const young = i % 3 === 1;
        return (
          <g key={i} transform={`translate(${x} ${stringAt(x)})`}>
            <g
              className="thoranam__leaf"
              style={{
                animationDuration: `${3.4 + jitter(i, 3) * 1.8}s`,
                animationDelay: `${-jitter(i, 4) * 4}s`,
              }}
            >
              {/* the stalk, folded back over the string */}
              <path d="M-3.5 -5Q0 -10 3.5 -5L2 3H-2Z" fill="#1f4f1b" />
              <path
                d={leafPath(length, half)}
                fill={`url(#${id}-${young ? "young" : "leaf"})`}
              />
              <path
                d={`M0 2Q1.5 ${length / 2} 0 ${length - 4}`}
                stroke="#c4dc8a"
                strokeWidth="1.1"
                opacity="0.7"
              />
              <g stroke="#c4dc8a" strokeWidth="0.7" opacity="0.32">
                {[0.25, 0.4, 0.55, 0.7].map((t) => (
                  <path
                    key={t}
                    d={`M${-half * 0.75} ${length * t - 6}L0 ${length * t}L${half * 0.75} ${length * t - 6}`}
                  />
                ))}
              </g>
            </g>
          </g>
        );
      })}

      {/* marigolds knotted between the leaves, alternating orange and yellow */}
      {Array.from({ length: leaves + 1 }, (_, i) => {
        const x = i * PITCH;
        const orange = i % 2 === 0;
        return (
          <g key={i} transform={`translate(${x} ${stringAt(x)})`}>
            <circle r="7.5" fill={orange ? "#e2701a" : "#f0ad1c"} />
            {Array.from({ length: 8 }, (_, k) => (
              <circle
                key={k}
                cx={Math.cos((k * Math.PI) / 4) * 5}
                cy={Math.sin((k * Math.PI) / 4) * 5}
                r="3.4"
                fill={orange ? "#f08a24" : "#f8c43a"}
              />
            ))}
            <circle r="2.6" fill={orange ? "#b8500f" : "#d58a12"} />
          </g>
        );
      })}
    </svg>
  );
}
