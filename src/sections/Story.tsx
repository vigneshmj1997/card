import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { story, type StoryChapter } from "../data/wedding";
import { STORY_SCENES } from "../components/art/StoryScenes";
import { SectionHeading } from "../components/SectionHeading";
import { Lotus3D, Sway3D } from "../components/art/Ornaments3D";
import "./Story.css";

/**
 * The timeline. Each chapter alternates sides on desktop and stacks on
 * mobile, with the illustration parallaxing at a different rate from the
 * text to sell depth without moving the copy itself.
 */

function Chapter({ chapter, index }: { chapter: StoryChapter; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const prefersReduced = useReducedMotion();
  const Scene = STORY_SCENES[chapter.scene];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Decorative layer only — parallax never touches the body copy.
  const artY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const artScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.06, 1, 1.06]);

  const flipped = index % 2 === 1;

  return (
    <li
      ref={ref}
      className={`chapter ${flipped ? "chapter--flipped" : ""}`}
    >
      <motion.div
        className="chapter__art"
        style={prefersReduced ? undefined : { y: artY, scale: artScale }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <Scene className="chapter__scene" />
      </motion.div>

      <motion.div
        className="chapter__body"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="chapter__year" aria-hidden="true">
          {chapter.year}
        </span>
        <h3 className="chapter__title">
          <span className="visually-hidden">{chapter.year} — </span>
          {chapter.title}
        </h3>
        <p className="chapter__text">{chapter.body}</p>
      </motion.div>

      {/* The node on the vertical rail. Decorative — the year is already
          announced as part of the heading above. */}
      <span className="chapter__node" aria-hidden="true" />
    </li>
  );
}

export function Story() {
  return (
    <section id="story" className="story" aria-labelledby="story-heading">
      <div className="container">
        <SectionHeading
          id="story-heading"
          eyebrow="How we got here"
          title="Our Story"
          lead="Seven years, one very slow coffee queue, and a great many wrong turns on the highway."
        />

        <ol className="story__list">
          {story.map((chapter, i) => (
            <Chapter key={chapter.id} chapter={chapter} index={i} />
          ))}
        </ol>

        {/* Closes the timeline rail — the lotus sits on the end of the
            line rather than floating loose beneath it. Laid back on its
            side so it reads as a flower on a turntable; drawn from above,
            it would otherwise turn edge-on and vanish. */}
        <Sway3D className="story__lotus" duration={11} range={30} tilt={52}>
          <Lotus3D />
        </Sway3D>
      </div>
    </section>
  );
}
