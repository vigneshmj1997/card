import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { CaretDoubleDown } from "@phosphor-icons/react";
import { invitation } from "../data/wedding";
import { Birds } from "../components/art/Ornaments";
import {
  CoconutPalm,
  DOORWAY,
  TempleGopuram,
  ThresholdKolam,
} from "../components/art/Temple";
import { useReducedMotion } from "../hooks/useReducedMotion";
import "./TempleEntrance.css";

/** Smoothstep: eases the walk in at both ends. */
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Where each beat of the walk-in falls, as fractions of the scroll
 * through this section. The doors start opening almost at once; the
 * walk overlaps them so the visitor is already moving as they part.
 */
const BEATS: Record<string, number[]> = {
  intro: [0, 0.08],
  doors: [0.03, 0.3],
  walk: [0.14, 0.94],
  // Stepping out of daylight into lamplight: a warm flash, then the
  // eye settles on the dim hall the card hangs in.
  flash: [0.7, 0.84, 0.97],
  dusk: [0.8, 0.98],
};

export function TempleEntrance() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Re-emitted through a plain motion value on purpose. Opacity mapped
  // straight off useScroll is handed to a native ViewTimeline, which
  // gets this section's offsets wrong — the welcome fades out and then
  // back in, and the hall never goes dark. Going through here keeps
  // every beat on the same JS-driven clock as the zoom.
  const progress = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => progress.set(v));

  // Measured rather than fixed: how far to zoom before the doorway is
  // wider and taller than this screen, and how far to lift it so it
  // ends up dead centre. Both depend on the viewport's shape.
  const zoom = useMotionValue(12);
  const lift = useMotionValue(0);
  const [origin, setOrigin] = useState("50% 85%");

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const gate = gateRef.current;
    if (!viewport || !gate) return;

    const measure = () => {
      // offset* are layout values, untouched by the zoom transform, so
      // this is correct even when measured mid-walk.
      const ox = gate.offsetLeft + gate.offsetWidth * DOORWAY.cx;
      const oy = gate.offsetTop + gate.offsetHeight * DOORWAY.cy;
      const doorW = gate.offsetWidth * DOORWAY.w;
      const doorH = gate.offsetHeight * DOORWAY.h;
      setOrigin(`${ox}px ${oy}px`);
      zoom.set(
        Math.min(
          60,
          1.25 * Math.max(viewport.clientWidth / doorW, viewport.clientHeight / doorH),
        ),
      );
      lift.set(viewport.clientHeight / 2 - oy);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [zoom, lift]);

  const walk = useTransform(progress, BEATS.walk, [0, 1], { ease: smooth });
  // Exponential, so the approach feels like walking at a steady pace
  // rather than accelerating into the wall.
  const scale = useTransform(() => Math.pow(zoom.get(), walk.get()));
  const y = useTransform(() => lift.get() * walk.get());

  const doors = useTransform(progress, BEATS.doors, [0, 1], { ease: smooth });
  const doorsAjar = useMotionValue(0.82);
  const introOpacity = useTransform(progress, BEATS.intro, [1, 0]);
  const flash = useTransform(progress, BEATS.flash, [0, 1, 0]);
  const dusk = useTransform(progress, BEATS.dusk, [0, 1]);

  // With reduced motion there is no walk: the gate stands still with its
  // doors already open, and a link takes you through.
  const open = reduced ? doorsAjar : doors;

  return (
    <section
      ref={sectionRef}
      className={`entrance ${reduced ? "entrance--still" : ""}`}
      aria-label="Temple entrance"
    >
      <div ref={viewportRef} className="entrance__viewport">
        <div className="entrance__sky" aria-hidden="true" />
        <Birds className="entrance__birds" />

        <motion.div
          className="entrance__world"
          style={reduced ? undefined : { scale, y, transformOrigin: origin }}
          aria-hidden="true"
        >
          <CoconutPalm className="entrance__palm entrance__palm--left" />
          <CoconutPalm className="entrance__palm entrance__palm--right" />
          <div className="entrance__wall" />
          <div className="entrance__ground">
            <ThresholdKolam className="entrance__kolam" />
          </div>
          {/* lamplight spilling out across the ground as the doors part */}
          <motion.div className="entrance__spill" style={{ opacity: open }} />
          <div ref={gateRef} className="entrance__gate">
            <TempleGopuram className="entrance__gopuram" doorOpen={open} />
          </div>
        </motion.div>

        {!reduced && (
          <>
            <motion.div className="entrance__flash" style={{ opacity: flash }} aria-hidden="true" />
            <motion.div className="entrance__dusk" style={{ opacity: dusk }} aria-hidden="true" />
          </>
        )}

        <motion.div
          className="entrance__welcome"
          style={reduced ? undefined : { opacity: introOpacity }}
        >
          <p className="script entrance__welcome-title">{invitation.welcome}</p>
          <p className="entrance__welcome-line">{invitation.welcomeLine}</p>
        </motion.div>

        {reduced ? (
          <a className="entrance__hint" href="#invitation">
            Enter the temple
            <CaretDoubleDown size={18} weight="bold" aria-hidden="true" />
          </a>
        ) : (
          <motion.p
            className="entrance__hint"
            style={{ opacity: introOpacity }}
            aria-hidden="true"
          >
            Scroll to enter
            <CaretDoubleDown className="entrance__hint-icon" size={18} weight="bold" />
          </motion.p>
        )}
      </div>
    </section>
  );
}
