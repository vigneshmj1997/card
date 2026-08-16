/**
 * Four illustrated vignettes for the story timeline — flat, layered
 * Ghibli-style scenes drawn entirely in SVG.
 *
 * Each one uses the same construction: a soft sky wash, mid-ground
 * silhouettes in a single flat tone, and a warm foreground. Depth comes
 * from value separation, not outlines.
 */

interface SceneProps {
  className?: string;
}

const SKY = {
  dawn: ["#F7C9A0", "#F3E2C7"],
  morning: ["#A9D6EC", "#DCEEF7"],
  dusk: ["#E9A06B", "#F6D9B0"],
  evening: ["#6E86B4", "#C9B7D4"],
} satisfies Record<string, [string, string]>;

/** Shared frame: rounded card with a clipped scene inside. */
function SceneFrame({
  id,
  sky,
  children,
  className,
}: {
  id: string;
  sky: [string, string];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky[0]} />
          <stop offset="100%" stopColor={sky[1]} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width="400" height="300" rx="20" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id}-clip)`}>
        <rect width="400" height="300" fill={`url(#${id}-sky)`} />
        {children}
      </g>
    </svg>
  );
}

/** Two figures at a coffee stall, steam rising. */
export function MeetingScene({ className }: SceneProps) {
  return (
    <SceneFrame id="scene-meeting" sky={SKY.morning} className={className}>
      {/* distant palms */}
      <g fill="#7FA98C" opacity="0.5">
        <rect x="48" y="150" width="5" height="70" />
        <path d="M50 152c-16-10-28-6-32 4 12-2 22 0 32 4Zm0 0c16-10 28-6 32 4-12-2-22 0-32 4Z" />
        <rect x="342" y="160" width="5" height="60" />
        <path d="M344 162c-14-9-25-5-28 4 10-2 19 0 28 4Zm0 0c14-9 25-5 28 4-10-2-19 0-28 4Z" />
      </g>

      {/* the stall */}
      <rect x="120" y="196" width="160" height="64" rx="6" fill="#B4763E" />
      <rect x="112" y="182" width="176" height="16" rx="5" fill="#8A5A2B" />
      {/* striped awning */}
      <path d="M104 182l24-40h144l24 40H104Z" fill="#D9534F" opacity="0.9" />
      <g fill="#FBF3E4" opacity="0.65">
        <path d="M148 142h16l-14 40h-16l14-40Z" />
        <path d="M196 142h16l-14 40h-16l14-40Z" />
        <path d="M244 142h16l-14 40h-16l14-40Z" />
      </g>

      {/* two tumblers of filter coffee, steam curling up */}
      <g fill="#C8A24A">
        <path d="M166 176h18l-3 20h-12l-3-20Z" />
        <path d="M216 176h18l-3 20h-12l-3-20Z" />
      </g>
      <g stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" fill="none">
        <path d="M175 170c-6-6 6-12 0-18" />
        <path d="M225 170c-6-6 6-12 0-18" />
      </g>

      {/* ground */}
      <rect y="260" width="400" height="40" fill="#C9A97A" />

      {/* the two of them, in front of the stall rather than behind it,
          standing a little too close for strangers */}
      <g>
        <circle cx="88" cy="222" r="14" fill="#3B2A1E" />
        <path d="M67 300v-46c0-12 9-21 21-21s21 9 21 21v46H67Z" fill="#4B2E72" />
        <circle cx="312" cy="220" r="14" fill="#3B2A1E" />
        <path d="M291 300v-48c0-12 9-21 21-21s21 9 21 21v48h-42Z" fill="#2E5D43" />
      </g>
    </SceneFrame>
  );
}

/** Temple corridor at dawn — the thousand-pillar hall. */
export function TempleScene({ className }: SceneProps) {
  const pillars = [30, 92, 154, 246, 308, 370];

  return (
    <SceneFrame id="scene-temple" sky={SKY.dawn} className={className}>
      {/* gopuram tiers rising in the distance */}
      <g fill="#8A5A2B" opacity="0.35">
        <path d="M160 190V120l10-18h60l10 18v70h-80Z" />
        <path d="M174 102V78l8-14h36l8 14v24h-52Z" />
        <path d="M188 64c0-8 5-13 12-13s12 5 12 13h-24Z" />
      </g>

      {/* corridor pillars — nearer ones are taller and darker */}
      {pillars.map((x, i) => {
        const near = x < 100 || x > 300;
        return (
          <g key={x} fill={near ? "#7A4E2D" : "#9C6B3C"} opacity={near ? 1 : 0.8}>
            <rect x={x} y={near ? 70 : 96} width={near ? 26 : 20} height={190} />
            {/* corbel bracket at the top */}
            <path
              d={
                near
                  ? `M${x - 6} 70h38l-6 14h-26l-6-14Z`
                  : `M${x - 4} 96h28l-4 12h-20l-4-12Z`
              }
            />
            <rect
              x={x - 4}
              y={252}
              width={near ? 34 : 28}
              height={10}
              fill={i % 2 ? "#6B4325" : "#7A4E2D"}
            />
          </g>
        );
      })}

      {/* light shaft falling between the middle pillars */}
      <path d="M180 40l60 0 40 220h-140L180 40Z" fill="#FFE9C4" opacity="0.45" />

      {/* two small figures walking into the light */}
      <g>
        <circle cx="192" cy="212" r="9" fill="#3B2A1E" />
        <path d="M179 262v-30c0-7 6-13 13-13s13 6 13 13v30h-26Z" fill="#4B2E72" />
        <circle cx="216" cy="210" r="9" fill="#3B2A1E" />
        <path d="M203 262v-32c0-7 6-13 13-13s13 6 13 13v32h-26Z" fill="#9A6A06" />
      </g>

      <rect y="260" width="400" height="40" fill="#B08A5E" />
      {/* a kolam chalked on the corridor floor */}
      <g stroke="#FBF3E4" strokeWidth="1.5" fill="none" opacity="0.55">
        <path d="M204 280c-8 4-8 12 0 16 8-4 8-12 0-16Z" />
        <path d="M190 288c6-6 22-6 28 0-6 6-22 6-28 0Z" />
      </g>
    </SceneFrame>
  );
}

/** The East Coast Road — a car, the sea, and a long sunset. */
export function CoastScene({ className }: SceneProps) {
  return (
    <SceneFrame id="scene-coast" sky={SKY.dusk} className={className}>
      {/* low sun with a reflected glare column */}
      <circle cx="290" cy="120" r="30" fill="#FFD98A" />
      <rect x="278" y="150" width="24" height="70" fill="#FFD98A" opacity="0.35" />

      {/* sea */}
      <rect y="150" width="400" height="70" fill="#4E8FA8" />
      <g stroke="#BFE3F2" strokeWidth="2" strokeLinecap="round" opacity="0.6">
        <path d="M30 170h40M110 182h30M210 172h44M320 186h40M60 196h34M250 198h40" />
      </g>

      {/* road, narrowing to a vanishing point */}
      <path d="M0 300l150-80h100l150 80H0Z" fill="#5A5148" />
      <g stroke="#F3E2C7" strokeWidth="4" strokeLinecap="round" opacity="0.85">
        <path d="M198 232h6M195 254h11M190 282h20" />
      </g>

      {/* sand shoulder */}
      <path d="M0 300v-40l150-40v80H0Z" fill="#D8B98A" />
      <path d="M400 300v-40l-150-40v80h150Z" fill="#D8B98A" />

      {/* the car, from behind */}
      <g>
        <path d="M168 268c0-14 8-26 32-26s32 12 32 26v14h-64v-14Z" fill="#C24A3E" />
        <path d="M178 252c2-8 6-12 22-12s20 4 22 12h-44Z" fill="#8FC8E8" />
        <circle cx="180" cy="284" r="7" fill="#33241A" />
        <circle cx="220" cy="284" r="7" fill="#33241A" />
        {/* tail lights */}
        <rect x="172" y="266" width="8" height="5" rx="2" fill="#FFB4A2" />
        <rect x="220" y="266" width="8" height="5" rx="2" fill="#FFB4A2" />
      </g>

      {/* palms leaning inland, the way coastal palms actually lean */}
      <g fill="#2E5D43" opacity="0.85">
        <path d="M42 300V216c0-4 6-4 6 0v84h-6Z" />
        <path d="M45 218c-18-12-32-6-36 6 14-4 26-2 36 4Zm0 0c18-12 32-6 36 6-14-4-26-2-36 4Z" />
        <path d="M352 300v-76c0-4 6-4 6 0v76h-6Z" />
        <path d="M355 226c-16-11-28-5-32 5 12-3 23-1 32 3Zm0 0c16-11 28-5 32 5-12-3-23-1-32 3Z" />
      </g>
    </SceneFrame>
  );
}

/** A terrace at night, two cups, one question. */
export function ProposalScene({ className }: SceneProps) {
  const stars = [
    [40, 40],
    [96, 26],
    [150, 52],
    [214, 32],
    [268, 60],
    [330, 30],
    [372, 66],
    [70, 78],
    [292, 96],
  ];

  return (
    <SceneFrame id="scene-proposal" sky={SKY.evening} className={className}>
      <g fill="#FFF3E0">
        {stars.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 2.2 : 1.5} opacity="0.85" />
        ))}
      </g>
      <circle cx="330" cy="66" r="22" fill="#FFF3E0" opacity="0.95" />
      <circle cx="320" cy="60" r="20" fill="#6E86B4" opacity="0.9" />

      {/* city rooftops below */}
      <g fill="#3E4A6B">
        <rect y="188" width="70" height="112" />
        <rect x="62" y="212" width="54" height="88" />
        <rect x="110" y="196" width="46" height="104" />
        <rect x="252" y="204" width="60" height="96" />
        <rect x="304" y="182" width="52" height="118" />
        <rect x="348" y="216" width="52" height="84" />
      </g>
      {/* lit windows, scattered rather than gridded */}
      <g fill="#FFD98A" opacity="0.85">
        <rect x="12" y="206" width="8" height="10" />
        <rect x="34" y="230" width="8" height="10" />
        <rect x="76" y="240" width="8" height="10" />
        <rect x="124" y="216" width="8" height="10" />
        <rect x="266" y="228" width="8" height="10" />
        <rect x="318" y="200" width="8" height="10" />
        <rect x="362" y="238" width="8" height="10" />
      </g>

      {/* terrace parapet */}
      <rect y="252" width="400" height="48" fill="#7A6A58" />
      <rect y="244" width="400" height="12" fill="#8E7C67" />

      {/* string lights across the top */}
      <path
        d="M0 96c60 34 120 34 200 18s140-16 200 10"
        stroke="#C9B7D4"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      <g fill="#FFD98A">
        <circle cx="52" cy="118" r="3.5" />
        <circle cx="118" cy="128" r="3.5" />
        <circle cx="188" cy="118" r="3.5" />
        <circle cx="256" cy="110" r="3.5" />
        <circle cx="324" cy="112" r="3.5" />
      </g>

      {/* two cups on the parapet, going cold again */}
      <g fill="#FBF3E4">
        <path d="M170 244h16l-2 10h-12l-2-10Z" />
        <path d="M214 244h16l-2 10h-12l-2-10Z" />
      </g>

      {/* the two of them, turned toward each other */}
      <g>
        <circle cx="146" cy="212" r="12" fill="#2A1F18" />
        <path d="M128 252v-28c0-10 8-18 18-18s18 8 18 18v28h-36Z" fill="#4B2E72" />
        <circle cx="252" cy="210" r="12" fill="#2A1F18" />
        <path d="M234 252v-30c0-10 8-18 18-18s18 8 18 18v30h-36Z" fill="#9A6A06" />
      </g>
    </SceneFrame>
  );
}

export const STORY_SCENES = {
  meeting: MeetingScene,
  temple: TempleScene,
  coast: CoastScene,
  proposal: ProposalScene,
} as const;
