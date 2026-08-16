import { Suspense, lazy, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { couple, wedding } from "../data/wedding";
import { KolamDivider, Birds, Thaali } from "../components/art/Ornaments";
import { Countdown } from "../components/Countdown";
import "./Hero.css";

// The 3D scene is ~600kb of three.js. Splitting it keeps the text and
// the countdown interactive long before WebGL is ready.
const GhibliScene = lazy(() =>
  import("../components/three/GhibliScene").then((m) => ({
    default: m.GhibliScene,
  })),
);

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Feed scroll progress to the 3D camera through a ref, not state —
  // this fires every frame and must never trigger a React render.
  useEffect(() => scrollYProgress.on("change", (v) => {
    progress.current = v;
  }), [scrollYProgress]);

  // Foreground parallax. Text lifts and fades as the valley opens up.
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-38%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const skyY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section ref={sectionRef} className="hero" aria-labelledby="hero-title">
      {/* Painted sky gradient sitting behind the WebGL layer. */}
      <motion.div
        className="hero__sky"
        style={{ y: prefersReduced ? 0 : skyY }}
        aria-hidden="true"
      />

      {/* One sticky viewport holds the canvas and the copy together, so
          both leave the screen when the hero ends. A fixed layer would
          linger and keep invisible links focusable over later sections. */}
      <div className="hero__viewport">
        <div className="hero__canvas" aria-hidden="true">
          <Suspense fallback={null}>
            <GhibliScene progress={progress} />
          </Suspense>
        </div>

        <Birds className="hero__birds" />

        <motion.div
          className="hero__content container"
          style={
            prefersReduced ? undefined : { y: titleY, opacity: titleOpacity }
          }
        >
          <motion.p
            className="hero__invite"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {wedding.invitationLine}
          </motion.p>

          <h1 id="hero-title" className="hero__title">
            <motion.span
              className="script hero__name"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {couple.bride.firstName}
            </motion.span>

            <motion.span
              className="hero__amp"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            >
              <Thaali className="hero__thaali" />
            </motion.span>
            <span className="visually-hidden"> and </span>

            <motion.span
              className="script hero__name"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {couple.groom.firstName}
            </motion.span>
          </h1>

          <motion.div
            className="hero__meta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <KolamDivider className="hero__kolam" />

            <p className="hero__date">
              <span>{wedding.dateLabel}</span>
              <span className="hero__dot" aria-hidden="true">
                •
              </span>
              <span>{wedding.city}</span>
            </p>

            <p className="hero__blessing" lang="ta">
              {wedding.blessing}
            </p>
            <p className="hero__blessing-translit">
              {wedding.blessingTranslit}
            </p>

            <Countdown targetISO={wedding.muhurthamISO} />

            <a className="hero__cta" href="#rsvp">
              Respond to the invitation
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero__scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          style={{ opacity: prefersReduced ? 1 : titleOpacity }}
          aria-hidden="true"
        >
          <span className="hero__scroll-label">Scroll</span>
          <span className="hero__scroll-line" />
        </motion.div>
      </div>
    </section>
  );
}
