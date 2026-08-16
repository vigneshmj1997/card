import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CaretLeft, CaretRight, Pause, Play } from "@phosphor-icons/react";
import { gallery } from "../data/wedding";
import { SectionHeading } from "../components/SectionHeading";
import { asset } from "../lib/asset";
import "./Gallery.css";

/**
 * A 3D ring carousel.
 *
 * Panels are arranged around a cylinder in real 3D space (preserve-3d,
 * rotateY + translateZ). The ring rotates rather than the panels, so
 * every face stays correctly oriented toward the viewer.
 *
 * Accessibility contract for auto-rotating content:
 *   - visible pause/play control
 *   - auto-rotation stops on hover, on focus within, and under
 *     prefers-reduced-motion
 *   - previous/next buttons and arrow keys reach every slide without
 *     dragging, and each slide is announced by position
 */

const AUTOPLAY_MS = 4200;

export function Gallery() {
  const count = gallery.length;
  const anglePer = 360 / count;
  // Radius that keeps neighbouring panels from intersecting.
  const radius = Math.round(260 / Math.tan(Math.PI / count));

  const prefersReduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(!prefersReduced);
  const [interacting, setInteracting] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  // Reduced motion is a standing instruction, not a one-time default:
  // if the user flips the OS setting mid-visit, autoplay must stop.
  useEffect(() => {
    if (prefersReduced) setPlaying(false);
  }, [prefersReduced]);

  useEffect(() => {
    if (!playing || interacting || prefersReduced) return;
    const id = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [playing, interacting, prefersReduced, go]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  }

  return (
    <section id="gallery" className="gallery" aria-labelledby="gallery-heading">
      <div className="container">
        <SectionHeading
          id="gallery-heading"
          eyebrow="Before all this"
          title="Moments"
          lead="A few of the ones that made it off the camera roll."
        />
      </div>

      <div
        ref={regionRef}
        className="gallery__stage"
        role="group"
        aria-roledescription="carousel"
        aria-label="Photographs of the couple"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onFocus={() => setInteracting(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setInteracting(false);
          }
        }}
      >
        <div className="gallery__perspective">
          <motion.div
            className="gallery__ring"
            animate={{ rotateY: -index * anglePer }}
            transition={
              prefersReduced
                ? { duration: 0 }
                : { type: "spring", stiffness: 70, damping: 18, mass: 0.9 }
            }
            style={{ transformStyle: "preserve-3d" }}
            // Dragging is an enhancement — the buttons and arrow keys
            // below are the accessible path to every slide.
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragStart={() => setInteracting(true)}
            onDragEnd={(_, info) => {
              setInteracting(false);
              if (Math.abs(info.offset.x) > 60) {
                go(info.offset.x < 0 ? 1 : -1);
              }
            }}
          >
            {gallery.map((photo, i) => {
              const isCurrent = i === index;
              return (
                <figure
                  key={photo.src}
                  className={`gallery__panel ${isCurrent ? "is-current" : ""}`}
                  style={{
                    transform: `rotateY(${i * anglePer}deg) translateZ(${radius}px)`,
                  }}
                  // Off-screen panels stay out of the a11y tree and the
                  // tab order; the live label below reports position.
                  aria-hidden={!isCurrent}
                  inert={!isCurrent}
                >
                  <GalleryImage src={photo.src} alt={photo.alt} />
                  <figcaption className="gallery__caption">
                    {photo.alt}
                  </figcaption>
                </figure>
              );
            })}
          </motion.div>
        </div>

        <div className="gallery__controls">
          <button
            type="button"
            className="gallery__btn"
            onClick={() => go(-1)}
            aria-label="Previous photograph"
          >
            <CaretLeft size={22} weight="bold" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="gallery__btn gallery__btn--play"
            onClick={() => setPlaying((p) => !p)}
            aria-label={
              playing ? "Pause automatic rotation" : "Play automatic rotation"
            }
          >
            {playing ? (
              <Pause size={20} weight="fill" aria-hidden="true" />
            ) : (
              <Play size={20} weight="fill" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            className="gallery__btn"
            onClick={() => go(1)}
            aria-label="Next photograph"
          >
            <CaretRight size={22} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <p className="gallery__status" aria-live="polite">
          Photograph {index + 1} of {count} — {gallery[index].alt}
        </p>
      </div>
    </section>
  );
}

/** Falls back to an illustrated card when the file is not there yet. */
function GalleryImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="gallery__placeholder">
        <svg viewBox="0 0 400 300" fill="none" aria-hidden="true">
          <rect width="400" height="300" fill="#DCEEF7" />
          <path d="M0 300l120-110 90 70 70-60 120 100H0Z" fill="#7FA98C" />
          <path d="M0 300l150-90 110 90H0Z" fill="#406E54" />
          <circle cx="310" cy="70" r="30" fill="#FFD98A" />
        </svg>
        {/* The caption below already carries the description — this only
            explains why there is no photograph here yet. */}
        <p className="gallery__placeholder-text">
          Add photos to <code>public/gallery/</code>
        </p>
      </div>
    );
  }

  return (
    <img
      className="gallery__image"
      src={asset(src)}
      alt={alt}
      width={400}
      height={300}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
